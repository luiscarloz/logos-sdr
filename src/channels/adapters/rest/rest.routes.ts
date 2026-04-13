import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { ChannelRouter } from '../../channel-router.js';
import { normalizeRESTMessage } from '../../message.normalizer.js';
import { z } from 'zod';

const chatMessageSchema = z.object({
  phone: z.string().optional(),
  name: z.string().optional(),
  content: z.string().min(1),
  source: z.string().optional(),
});

export async function restChatRoutes(app: FastifyInstance) {
  const router = container.resolve(ChannelRouter);

  // Main chat endpoint
  app.post('/chat', async (request) => {
    const tenantId = (request as any).tenantId as string;
    const body = chatMessageSchema.parse(request.body);

    const inbound = normalizeRESTMessage(tenantId, body);
    const outbound = await router.handleInbound(inbound);

    return {
      reply: outbound.content,
      metadata: outbound.metadata,
    };
  });
}
