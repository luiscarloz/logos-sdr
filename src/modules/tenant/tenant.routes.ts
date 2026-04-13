import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { TenantService } from './tenant.service.js';
import { z } from 'zod';

const createTenantSchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  industry: z.enum(['real_estate', 'english_school', 'law_firm']),
  llm_provider: z.enum(['anthropic', 'openai', 'gemini']).optional(),
  llm_model: z.string().optional(),
  llm_api_key: z.string().min(1),
  system_prompt: z.string().optional(),
  config: z.record(z.unknown()).optional(),
});

const updateTenantSchema = createTenantSchema.partial();

const upsertPromptSchema = z.object({
  step: z.string().min(1),
  system_prompt: z.string().min(1),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().min(1).optional(),
});

const createChannelSchema = z.object({
  channel_type: z.enum(['whatsapp', 'rest', 'webchat']),
  config: z.record(z.unknown()),
});

export async function tenantRoutes(app: FastifyInstance) {
  const service = container.resolve(TenantService);

  // List tenants
  app.get('/tenants', async () => {
    return service.list();
  });

  // Create tenant
  app.post('/tenants', async (request, reply) => {
    const body = createTenantSchema.parse(request.body);
    const tenant = await service.create(body);
    return reply.status(201).send(tenant);
  });

  // Get tenant by ID
  app.get<{ Params: { id: string } }>('/tenants/:id', async (request) => {
    return service.getById(request.params.id);
  });

  // Update tenant
  app.patch<{ Params: { id: string } }>('/tenants/:id', async (request) => {
    const body = updateTenantSchema.parse(request.body);
    return service.update(request.params.id, body);
  });

  // Prompts
  app.get<{ Params: { id: string } }>('/tenants/:id/prompts', async (request) => {
    return service.getPrompts(request.params.id);
  });

  app.put<{ Params: { id: string } }>('/tenants/:id/prompts', async (request) => {
    const body = upsertPromptSchema.parse(request.body);
    return service.upsertPrompt(
      request.params.id,
      body.step,
      body.system_prompt,
      body.temperature,
      body.max_tokens,
    );
  });

  // Channels
  app.get<{ Params: { id: string } }>('/tenants/:id/channels', async (request) => {
    return service.getChannels(request.params.id);
  });

  app.post<{ Params: { id: string } }>('/tenants/:id/channels', async (request, reply) => {
    const body = createChannelSchema.parse(request.body);
    const channel = await service.createChannel(request.params.id, body.channel_type, body.config);
    return reply.status(201).send(channel);
  });
}
