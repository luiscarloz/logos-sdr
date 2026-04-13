import { FastifyInstance } from 'fastify';
import { container } from 'tsyringe';
import { ConversationService } from './conversation.service.js';

export async function conversationRoutes(app: FastifyInstance) {
  const service = container.resolve(ConversationService);

  // Get conversation with messages
  app.get<{ Params: { id: string } }>('/conversations/:id', async (request) => {
    return service.getConversation(request.params.id);
  });
}
