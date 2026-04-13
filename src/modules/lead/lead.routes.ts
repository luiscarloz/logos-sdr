import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { LeadService } from './lead.service.js';
import { z } from 'zod';

const createLeadSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  source: z.string().optional(),
  profile: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

const listLeadsQuery = z.object({
  status: z.string().optional(),
  score_label: z.string().optional(),
});

export async function leadRoutes(app: FastifyInstance) {
  const service = container.resolve(LeadService);

  // List leads for tenant
  app.get('/leads', async (request) => {
    const tenantId = (request as any).tenantId as string;
    const query = listLeadsQuery.parse(request.query);
    return service.listByTenant(tenantId, {
      status: query.status,
      scoreLabel: query.score_label,
    });
  });

  // Create lead
  app.post('/leads', async (request, reply) => {
    const tenantId = (request as any).tenantId as string;
    const body = createLeadSchema.parse(request.body);
    const lead = await service.create({ ...body, tenant_id: tenantId });
    return reply.status(201).send(lead);
  });

  // Get lead by ID
  app.get<{ Params: { id: string } }>('/leads/:id', async (request) => {
    return service.getById(request.params.id);
  });

  // Update lead profile
  app.patch<{ Params: { id: string } }>('/leads/:id/profile', async (request) => {
    const profile = z.record(z.unknown()).parse(request.body);
    return service.updateProfile(request.params.id, profile);
  });
}
