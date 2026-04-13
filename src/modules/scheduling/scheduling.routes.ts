import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { SchedulingService } from './scheduling.service.js';
import { z } from 'zod';

const bookSchema = z.object({
  lead_id: z.string().uuid(),
  conversation_id: z.string().uuid().optional(),
  scheduled_at: z.string(),
  agent_name: z.string().optional(),
  duration_minutes: z.number().int().optional(),
  type: z.string().optional(),
  notes: z.string().optional(),
});

const slotsQuerySchema = z.object({
  from: z.string(),
  to: z.string(),
});

export async function schedulingRoutes(app: FastifyInstance) {
  const service = container.resolve(SchedulingService);

  // Get available slots
  app.get('/scheduling/slots', async (request) => {
    const tenantId = (request as any).tenantId as string;
    const query = slotsQuerySchema.parse(request.query);
    return service.getAvailableSlots(tenantId, query.from, query.to);
  });

  // Book appointment
  app.post('/scheduling/book', async (request, reply) => {
    const tenantId = (request as any).tenantId as string;
    const body = bookSchema.parse(request.body);
    const appointment = await service.book({
      tenantId,
      leadId: body.lead_id,
      conversationId: body.conversation_id,
      scheduledAt: body.scheduled_at,
      agentName: body.agent_name,
      durationMinutes: body.duration_minutes,
      type: body.type,
      notes: body.notes,
    });
    return reply.status(201).send(appointment);
  });

  // Get appointments by lead
  app.get<{ Params: { leadId: string } }>(
    '/scheduling/lead/:leadId',
    async (request) => {
      return service.getByLead(request.params.leadId);
    },
  );

  // Cancel appointment
  app.delete<{ Params: { id: string } }>(
    '/scheduling/:id',
    async (request, reply) => {
      await service.cancel(request.params.id);
      return reply.status(204).send();
    },
  );
}
