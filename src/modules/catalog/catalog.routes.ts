import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { CatalogService } from './catalog.service.js';
import { z } from 'zod';

const createItemSchema = z.object({
  category: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  attributes: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

const searchSchema = z.object({
  category: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export async function catalogRoutes(app: FastifyInstance) {
  const service = container.resolve(CatalogService);

  // List catalog items
  app.get('/catalog', async (request) => {
    const tenantId = (request as any).tenantId as string;
    const query = searchSchema.parse(request.query);
    return service.list(tenantId, query.category);
  });

  // Search catalog
  app.post('/catalog/search', async (request) => {
    const tenantId = (request as any).tenantId as string;
    const body = z
      .object({
        category: z.string().optional(),
        attributes: z.record(z.unknown()).optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().optional(),
      })
      .parse(request.body);

    return service.search(tenantId, body);
  });

  // Create catalog item
  app.post('/catalog', async (request, reply) => {
    const tenantId = (request as any).tenantId as string;
    const body = createItemSchema.parse(request.body);
    const item = await service.create(tenantId, body);
    return reply.status(201).send(item);
  });

  // Update catalog item
  app.patch<{ Params: { id: string } }>('/catalog/:id', async (request) => {
    const body = createItemSchema.partial().parse(request.body);
    return service.update(request.params.id, body);
  });

  // Delete catalog item
  app.delete<{ Params: { id: string } }>('/catalog/:id', async (request, reply) => {
    await service.delete(request.params.id);
    return reply.status(204).send();
  });

  // Schema
  app.get('/catalog/schema', async (request) => {
    const tenantId = (request as any).tenantId as string;
    return service.getSchema(tenantId);
  });

  app.put('/catalog/schema', async (request) => {
    const tenantId = (request as any).tenantId as string;
    const body = z
      .object({
        field_name: z.string().min(1),
        field_type: z.enum(['number', 'text', 'enum', 'boolean']),
        field_label: z.string().min(1),
        options: z.array(z.unknown()).nullable().optional(),
        filterable: z.boolean().optional(),
        required: z.boolean().optional(),
      })
      .parse(request.body);

    return service.upsertSchemaField(tenantId, {
      field_name: body.field_name,
      field_type: body.field_type,
      field_label: body.field_label,
      options: body.options ?? null,
      filterable: body.filterable ?? true,
      required: body.required ?? false,
    });
  });
}
