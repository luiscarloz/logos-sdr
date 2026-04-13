import { inject, injectable } from 'tsyringe';
import { SupabaseClient } from '@supabase/supabase-js';
import { Conversation, Message } from '../../shared/types/conversation.js';
import { NotFoundError } from '../../shared/errors/index.js';

@injectable()
export class ConversationRepository {
  constructor(@inject('SupabaseClient') private db: SupabaseClient) {}

  async findById(id: string): Promise<Conversation> {
    const { data, error } = await this.db
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundError('Conversation', id);
    return data as Conversation;
  }

  async findActiveByLeadAndChannel(
    leadId: string,
    channelType: string,
  ): Promise<Conversation | null> {
    const { data } = await this.db
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .eq('channel_type', channelType)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return (data as Conversation) ?? null;
  }

  async create(
    conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Conversation> {
    const { data, error } = await this.db
      .from('conversations')
      .insert(conversation)
      .select()
      .single();

    if (error) throw new Error(`Failed to create conversation: ${error.message}`);
    return data as Conversation;
  }

  async update(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const { data, error } = await this.db
      .from('conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError('Conversation', id);
    return data as Conversation;
  }

  // Messages
  async getMessages(conversationId: string, limit = 15): Promise<Message[]> {
    const { data, error } = await this.db
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw new Error(`Failed to get messages: ${error.message}`);
    return (data ?? []) as Message[];
  }

  async getRecentMessages(conversationId: string, limit = 15): Promise<Message[]> {
    // Get last N messages, then return in chronological order
    const { data, error } = await this.db
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get messages: ${error.message}`);
    return ((data ?? []) as Message[]).reverse();
  }

  async addMessage(
    message: Omit<Message, 'id' | 'created_at'>,
  ): Promise<Message> {
    const { data, error } = await this.db
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw new Error(`Failed to add message: ${error.message}`);
    return data as Message;
  }
}
