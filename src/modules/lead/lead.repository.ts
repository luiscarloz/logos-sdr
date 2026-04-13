import { inject, injectable } from 'tsyringe';
import { SupabaseClient } from '@supabase/supabase-js';
import { Lead } from '../../shared/types/lead.js';
import { NotFoundError } from '../../shared/errors/index.js';

@injectable()
export class LeadRepository {
  constructor(@inject('SupabaseClient') private db: SupabaseClient) {}

  async findById(id: string): Promise<Lead> {
    const { data, error } = await this.db
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundError('Lead', id);
    return data as Lead;
  }

  async findByPhone(tenantId: string, phone: string): Promise<Lead | null> {
    const { data } = await this.db
      .from('leads')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('phone', phone)
      .single();

    return (data as Lead) ?? null;
  }

  async create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const { data, error } = await this.db
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) throw new Error(`Failed to create lead: ${error.message}`);
    return data as Lead;
  }

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await this.db
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError('Lead', id);
    return data as Lead;
  }

  async listByTenant(
    tenantId: string,
    filters?: { status?: string; scoreLabel?: string },
  ): Promise<Lead[]> {
    let query = this.db
      .from('leads')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.scoreLabel) query = query.eq('score_label', filters.scoreLabel);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list leads: ${error.message}`);
    return (data ?? []) as Lead[];
  }

  async findOrCreate(
    tenantId: string,
    phone: string,
    defaults: Partial<Lead>,
  ): Promise<{ lead: Lead; created: boolean }> {
    const existing = await this.findByPhone(tenantId, phone);
    if (existing) return { lead: existing, created: false };

    const lead = await this.create({
      tenant_id: tenantId,
      external_id: null,
      phone,
      email: defaults.email ?? null,
      name: defaults.name ?? null,
      source: defaults.source ?? null,
      status: 'new',
      score: 0,
      score_label: 'cold',
      profile: defaults.profile ?? {},
      tags: defaults.tags ?? [],
      assigned_to: null,
    });

    return { lead, created: true };
  }

  async updateProfile(id: string, profileUpdates: Record<string, unknown>): Promise<Lead> {
    const lead = await this.findById(id);
    const mergedProfile = { ...lead.profile, ...profileUpdates };
    return this.update(id, { profile: mergedProfile });
  }
}
