import { OutboundMessage } from '../../../shared/types/channel.js';
import { Logger } from '../../../shared/utils/logger.js';

export interface WhatsAppChannelConfig {
  evolution_api_url: string;
  evolution_api_key: string;
  instance_name: string;
}

export class WhatsAppAdapter {
  constructor(private logger: Logger) {}

  async send(message: OutboundMessage, channelConfig: Record<string, unknown>): Promise<void> {
    const config = channelConfig as unknown as WhatsAppChannelConfig;

    if (!config.evolution_api_url || !config.instance_name) {
      this.logger.error({ channelConfig }, 'Missing WhatsApp channel config');
      return;
    }

    const url = `${config.evolution_api_url}/message/sendText/${config.instance_name}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.evolution_api_key,
      },
      body: JSON.stringify({
        number: message.recipientPhone,
        text: message.content,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(
        { status: response.status, body, phone: message.recipientPhone },
        'Failed to send WhatsApp message',
      );
    } else {
      this.logger.info(
        { phone: message.recipientPhone },
        'WhatsApp message sent',
      );
    }
  }
}
