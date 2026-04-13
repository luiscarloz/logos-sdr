import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from 'tsyringe';
import { TenantService } from '../../modules/tenant/tenant.service.js';
import { UnauthorizedError } from '../errors/index.js';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string;
  }
}

export async function tenantResolver(request: FastifyRequest, _reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    throw new UnauthorizedError('Missing X-API-Key header');
  }

  const service = container.resolve(TenantService);
  const tenant = await service.getByApiKey(apiKey);

  if (!tenant) {
    throw new UnauthorizedError('Invalid API key');
  }

  request.tenantId = tenant.id;
}
