import { InboundMessage } from '../shared/types/channel.js';
import { generateId } from '../shared/utils/id.js';

export interface RawRESTMessage {
  phone?: string;
  name?: string;
  content: string;
  source?: string;
}

export function normalizeRESTMessage(
  tenantId: string,
  raw: RawRESTMessage,
): InboundMessage {
  return {
    channelType: 'rest',
    channelMessageId: generateId(),
    tenantId,
    senderPhone: raw.phone,
    senderName: raw.name,
    content: raw.content,
    timestamp: new Date(),
    raw,
  };
}
