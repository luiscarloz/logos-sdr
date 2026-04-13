import { inject, injectable } from 'tsyringe';
import { CatalogRepository, CatalogFilter } from './catalog.repository.js';
import { CatalogItem, CatalogSchema } from '../../shared/types/catalog.js';

@injectable()
export class CatalogService {
  constructor(@inject(CatalogRepository) private repo: CatalogRepository) {}

  async search(tenantId: string, filters: CatalogFilter): Promise<CatalogItem[]> {
    return this.repo.search(tenantId, filters);
  }

  async searchForLead(
    tenantId: string,
    leadProfile: Record<string, unknown>,
  ): Promise<CatalogItem[]> {
    // Build filters from lead profile data
    const filters: CatalogFilter = { limit: 5 };

    if (leadProfile.property_type || leadProfile.category) {
      filters.category = (leadProfile.property_type ?? leadProfile.category) as string;
    }

    const attributes: Record<string, unknown> = {};

    // Price range
    if (leadProfile.budget || leadProfile.max_price) {
      attributes.price = { max: leadProfile.budget ?? leadProfile.max_price };
    }
    if (leadProfile.min_price) {
      attributes.price = { ...(attributes.price as object ?? {}), min: leadProfile.min_price };
    }

    // Location
    if (leadProfile.neighborhood || leadProfile.location) {
      attributes.neighborhood = leadProfile.neighborhood ?? leadProfile.location;
    }

    // Bedrooms
    if (leadProfile.bedrooms) {
      attributes.bedrooms = leadProfile.bedrooms;
    }

    if (Object.keys(attributes).length > 0) {
      filters.attributes = attributes;
    }

    if (leadProfile.tags && Array.isArray(leadProfile.tags)) {
      filters.tags = leadProfile.tags as string[];
    }

    return this.repo.search(tenantId, filters);
  }

  async formatForPrompt(items: CatalogItem[]): Promise<string> {
    if (items.length === 0) return 'Nenhum item encontrado no catálogo com esses critérios.';

    return items
      .map((item, i) => {
        const attrs = Object.entries(item.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        return `${i + 1}. **${item.title}**${item.category ? ` (${item.category})` : ''}\n   ${item.description ?? ''}\n   ${attrs}${item.tags.length > 0 ? `\n   Tags: ${item.tags.join(', ')}` : ''}`;
      })
      .join('\n\n');
  }

  // CRUD
  async create(
    tenantId: string,
    input: {
      category?: string;
      title: string;
      description?: string;
      attributes?: Record<string, unknown>;
      tags?: string[];
    },
  ): Promise<CatalogItem> {
    return this.repo.create({
      tenant_id: tenantId,
      category: input.category ?? null,
      title: input.title,
      description: input.description ?? null,
      attributes: input.attributes ?? {},
      available: true,
      tags: input.tags ?? [],
    });
  }

  async update(id: string, updates: Partial<CatalogItem>): Promise<CatalogItem> {
    return this.repo.update(id, updates);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async list(tenantId: string, category?: string): Promise<CatalogItem[]> {
    return this.repo.listByTenant(tenantId, category);
  }

  // Schema
  async getSchema(tenantId: string): Promise<CatalogSchema[]> {
    return this.repo.getSchema(tenantId);
  }

  async upsertSchemaField(
    tenantId: string,
    field: Omit<CatalogSchema, 'id' | 'tenant_id'>,
  ): Promise<CatalogSchema> {
    return this.repo.upsertSchemaField({ ...field, tenant_id: tenantId });
  }
}
