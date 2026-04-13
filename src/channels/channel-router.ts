import { inject, injectable } from 'tsyringe';
import { ConversationService } from '../modules/conversation/conversation.service.js';
import { InboundMessage, OutboundMessage } from '../shared/types/channel.js';
import { Logger } from '../shared/utils/logger.js';

@injectable()
export class ChannelRouter {
  constructor(
    @inject(ConversationService) private conversationService: ConversationService,
    @inject('Logger') private logger: Logger,
  ) {}

  async handleInbound(message: InboundMessage): Promise<OutboundMessage> {
    this.logger.info(
      {
        channelType: message.channelType,
        tenantId: message.tenantId,
        senderPhone: message.senderPhone,
      },
      'Inbound message received',
    );

    const response = await this.conversationService.handleMessage(message);

    this.logger.info(
      {
        channelType: response.channelType,
        conversationId: response.metadata?.conversationId,
        step: response.metadata?.step,
      },
      'Outbound message ready',
    );

    return response;
  }
}
