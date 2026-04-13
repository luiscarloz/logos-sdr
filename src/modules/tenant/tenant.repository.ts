import { inject, injectable } from 'tsyringe';
import { SupabaseClient } from '@supabase/supabase-js';
import { Tenant, TenantPrompt, TenantChannel } from '../../shared/types/tenant.js';
import { NotFoundError } from '../../shared/errors/index.js';

@injectable()
export class TenantRepository {
  constructor(@inject('SupabaseClient') private db: SupabaseClient) {}

  async findById(id: string): Promise<Tenant> {
    const { data, error } = await this.db
      .from('tenants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundError('Tenant', id);
    return data as Tenant;
  }

  async findByApiKey(apiKey: string): Promise<Tenant | null> {
    const { data } = await this.db
      .from('tenants')
      .select('*')
      .eq('api_key', apiKey)
      .eq('active', true)
      .single();

    return (data as Tenant) ?? null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const { data } = await this.db
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .single();

    return (data as Tenant) ?? null;
  }

  async create(tenant: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>): Promise<Tenant> {
    const { data, error } = await this.db
      .from('tenants')
      .insert(tenant)
      .select()
      .single();

    if (error) throw new Error(`Failed to create tenant: ${error.message}`);
    return data as Tenant;
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const { data, error } = await this.db
      .from('tenants')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError('Tenant', id);
    return data as Tenant;
  }

  async list(): Promise<Tenant[]> {
    const { data, error } = await this.db
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to list tenants: ${error.message}`);
    return (data ?? []) as Tenant[];
  }

  // Prompts
  async getPrompts(tenantId: string): Promise<TenantPrompt[]> {
    const { data } = await this.db
      .from('tenant_prompts')
      .select('*')
      .eq('tenant_id', tenantId);

    return (data ?? []) as TenantPrompt[];
  }

  async getPromptByStep(tenantId: string, step: string): Promise<TenantPrompt | null> {
    const { data } = await this.db
      .from('tenant_prompts')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('step', step)
      .single();

    return (data as TenantPrompt) ?? null;
  }

  async upsertPrompt(
    prompt: Omit<TenantPrompt, 'id' | 'created_at'>,
  ): Promise<TenantPrompt> {
    const { data, error } = await this.db
      .from('tenant_prompts')
      .upsert(prompt, { onConflict: 'tenant_id,step' })
      .select()
      .single();

    if (error) throw new Error(`Failed to upsert prompt: ${error.message}`);
    return data as TenantPrompt;
  }

  // Channels
  async getChannels(tenantId: string): Promise<TenantChannel[]> {
    const { data } = await this.db
      .from('tenant_channels')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true);

    return (data ?? []) as TenantChannel[];
  }

  async findChannelById(channelId: string): Promise<TenantChannel | null> {
    const { data } = await this.db
      .from('tenant_channels')
      .select('*')
      .eq('id', channelId)
      .single();

    return (data as TenantChannel) ?? null;
  }

  async createChannel(
    channel: Omit<TenantChannel, 'id' | 'created_at'>,
  ): Promise<TenantChannel> {
    const { data, error } = await this.db
      .from('tenant_channels')
      .insert(channel)
      .select()
      .single();

    if (error) throw new Error(`Failed to create channel: ${error.message}`);
    return data as TenantChannel;
  }
}
