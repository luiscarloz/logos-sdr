import 'dotenv/config';
import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { loadEnv } from './config/env.js';
import { setupContainer } from './config/container.js';
import { createErrorHandler } from './shared/middleware/error-handler.js';
import { tenantResolver } from './shared/middleware/tenant-resolver.js';
import { tenantRoutes } from './modules/tenant/tenant.routes.js';
import { leadRoutes } from './modules/lead/lead.routes.js';
import { conversationRoutes } from './modules/conversation/conversation.routes.js';
import { restChatRoutes } from './channels/adapters/rest/rest.routes.js';
import { whatsappWebhookRoutes } from './channels/adapters/whatsapp/whatsapp.webhook.js';
import { catalogRoutes } from './modules/catalog/catalog.routes.js';
import { schedulingRoutes } from './modules/scheduling/scheduling.routes.js';
import { createLogger } from './shared/utils/logger.js';

async function main() {
  const env = loadEnv();
  const logger = createLogger(env.LOG_LEVEL);

  setupContainer();

  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true });

  app.setErrorHandler(createErrorHandler(logger));

  // Health check (no auth)
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Admin routes (tenant management - no tenant auth needed)
  await app.register(
    async (adminApp) => {
      await adminApp.register(tenantRoutes);
    },
    { prefix: '/api/v1/admin' },
  );

  // Tenant-scoped routes (require X-API-Key)
  await app.register(
    async (tenantApp) => {
      tenantApp.addHook('onRequest', tenantResolver);
      await tenantApp.register(leadRoutes);
      await tenantApp.register(conversationRoutes);
      await tenantApp.register(restChatRoutes);
      await tenantApp.register(catalogRoutes);
      await tenantApp.register(schedulingRoutes);
    },
    { prefix: '/api/v1' },
  );

  // WhatsApp webhooks (no tenant auth - resolved from channel config)
  await app.register(whatsappWebhookRoutes);

  await app.listen({ port: env.PORT, host: env.HOST });
  logger.info({ port: env.PORT, host: env.HOST }, 'SDR server started');
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
