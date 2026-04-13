import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { ChannelRouter } from '../../channel-router.js';
import { WhatsAppAdapter } from './whatsapp.adapter.js';
import { parseEvolutionWebhook, EvolutionWebhookPayload } from './whatsapp.mapper.js';
import { TenantRepository } from '../../../modules/tenant/tenant.repository.js';
import { Logger } from '../../../shared/utils/logger.js';

export async function whatsappWebhookRoutes(app: FastifyInstance) {
  const router = container.resolve(ChannelRouter);
  const tenantRepo = container.resolve(TenantRepository);
  const logger = container.resolve<Logger>('Logger');
  const whatsappAdapter = new WhatsAppAdapter(logger);

  // Webhook receiver from Evolution API
  app.post<{ Params: { channelId: string } }>(
    '/webhooks/whatsapp/:channelId',
    async (request, reply) => {
      const { channelId } = request.params;
      const payload = request.body as EvolutionWebhookPayload;

      // Look up tenant from channel config
      const channel = await tenantRepo.findChannelById(channelId);
      if (!channel) {
        return reply.status(404).send({ error: 'Channel not found' });
      }

      // Parse the webhook payload
      const inbound = parseEvolutionWebhook(channel.tenant_id, payload);
      if (!inbound) {
        // Not a processable message (outgoing, status update, etc.)
        return reply.status(200).send({ status: 'ignored' });
      }

      // Process through conversation engine
      const outbound = await router.handleInbound(inbound);

      // Send reply via WhatsApp
      await whatsappAdapter.send(outbound, channel.config);

      return reply.status(200).send({ status: 'processed' });
    },
  );
}
