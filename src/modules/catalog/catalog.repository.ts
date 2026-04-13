import { inject, injectable } from 'tsyringe';
import { SupabaseClient } from '@supabase/supabase-js';
import { CatalogItem, CatalogSchema } from '../../shared/types/catalog.js';
import { NotFoundError } from '../../shared/errors/index.js';

export interface CatalogFilter {
  category?: string;
  attributes?: Record<string, unknown>;
  tags?: string[];
  limit?: number;
}

@injectable()
export class CatalogRepository {
  constructor(@inject('SupabaseClient') private db: SupabaseClient) {}

  async findById(id: string): Promise<CatalogItem> {
    const { data, error } = await this.db
      .from('catalog_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundError('CatalogItem', id);
    return data as CatalogItem;
  }

  async search(tenantId: string, filters: CatalogFilter): Promise<CatalogItem[]> {
    let query = this.db
      .from('catalog_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('available', true);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // JSONB attribute filtering
    if (filters.attributes) {
      for (const [key, value] of Object.entries(filters.attributes)) {
        if (typeof value === 'object' && value !== null) {
          const filter = value as { min?: number; max?: number };
          if (filter.min !== undefined) {
            query = query.gte(`attributes->>${key}`, filter.min);
          }
          if (filter.max !== undefined) {
            query = query.lte(`attributes->>${key}`, filter.max);
          }
        } else {
          query = query.eq(`attributes->>${key}`, String(value));
        }
      }
    }

    query = query.limit(filters.limit ?? 10);

    const { data, error } = await query;
    if (error) throw new Error(`Catalog search failed: ${error.message}`);
    return (data ?? []) as CatalogItem[];
  }

  async create(item: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>): Promise<CatalogItem> {
    const { data, error } = await this.db
      .from('catalog_items')
      .insert(item)
      .select()
      .single();

    if (error) throw new Error(`Failed to create catalog item: ${error.message}`);
    return data as CatalogItem;
  }

  async update(id: string, updates: Partial<CatalogItem>): Promise<CatalogItem> {
    const { data, error } = await this.db
      .from('catalog_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundError('CatalogItem', id);
    return data as CatalogItem;
  }

  async delete(id: string): Promise<void> {
    await this.db.from('catalog_items').delete().eq('id', id);
  }

  async listByTenant(tenantId: string, category?: string): Promise<CatalogItem[]> {
    let query = this.db
      .from('catalog_items')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to list catalog: ${error.message}`);
    return (data ?? []) as CatalogItem[];
  }

  // Schema
  async getSchema(tenantId: string): Promise<CatalogSchema[]> {
    const { data } = await this.db
      .from('catalog_schemas')
      .select('*')
      .eq('tenant_id', tenantId);

    return (data ?? []) as CatalogSchema[];
  }

  async upsertSchemaField(
    field: Omit<CatalogSchema, 'id'>,
  ): Promise<CatalogSchema> {
    const { data, error } = await this.db
      .from('catalog_schemas')
      .upsert(field, { onConflict: 'tenant_id,field_name' })
      .select()
      .single();

    if (error) throw new Error(`Failed to upsert schema field: ${error.message}`);
    return data as CatalogSchema;
  }
}
