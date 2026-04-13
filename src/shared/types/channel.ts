export interface InboundMessage {
  channelType: string;
  channelMessageId: string;
  tenantId: string;
  senderPhone?: string;
  senderName?: string;
  content: string;
  mediaUrl?: string;
  timestamp: Date;
  raw: unknown;
}

export interface OutboundMessage {
  channelType: string;
  recipientPhone?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelAdapter {
  readonly channelType: string;
  send(message: OutboundMessage, channelConfig: Record<string, unknown>): Promise<void>;
  parseInbound(rawPayload: unknown): InboundMessage;
}
