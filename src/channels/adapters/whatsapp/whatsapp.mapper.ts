import { InboundMessage } from '../../../shared/types/channel.js';

// Evolution API webhook payload structure
export interface EvolutionWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
      imageMessage?: {
        caption?: string;
        url?: string;
      };
      audioMessage?: {
        url?: string;
      };
    };
    messageTimestamp?: number;
  };
}

export function parseEvolutionWebhook(
  tenantId: string,
  payload: EvolutionWebhookPayload,
): InboundMessage | null {
  // Only process incoming text messages
  if (payload.data.key.fromMe) return null;

  const message = payload.data.message;
  if (!message) return null;

  const content =
    message.conversation ??
    message.extendedTextMessage?.text ??
    message.imageMessage?.caption ??
    '';

  if (!content.trim()) return null;

  // Extract phone from remoteJid (format: 5511999999999@s.whatsapp.net)
  const phone = payload.data.key.remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');

  return {
    channelType: 'whatsapp',
    channelMessageId: payload.data.key.id,
    tenantId,
    senderPhone: phone,
    senderName: payload.data.pushName,
    content,
    mediaUrl: message.imageMessage?.url ?? message.audioMessage?.url,
    timestamp: new Date((payload.data.messageTimestamp ?? Date.now() / 1000) * 1000),
    raw: payload,
  };
}
