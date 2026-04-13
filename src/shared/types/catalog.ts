export interface CatalogItem {
  id: string;
  tenant_id: string;
  category: string | null;
  title: string;
  description: string | null;
  attributes: Record<string, unknown>;
  available: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CatalogSchema {
  id: string;
  tenant_id: string;
  field_name: string;
  field_type: 'number' | 'text' | 'enum' | 'boolean';
  field_label: string;
  options: unknown[] | null;
  filterable: boolean;
  required: boolean;
}
