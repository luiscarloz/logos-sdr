export type ConversationStatus = 'active' | 'paused' | 'completed' | 'handed_off';
export type MessageRole = 'lead' | 'assistant' | 'system';

export interface Conversation {
  id: string;
  tenant_id: string;
  lead_id: string;
  channel_type: string;
  channel_id: string | null;
  current_step: string;
  step_data: Record<string, unknown>;
  context: Record<string, unknown>;
  status: ConversationStatus;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
