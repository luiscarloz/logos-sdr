-- Generic catalog: properties, courses, legal services, etc.
CREATE TABLE catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category TEXT,
    title TEXT NOT NULL,
    description TEXT,
    attributes JSONB NOT NULL DEFAULT '{}',
    available BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_tenant ON catalog_items(tenant_id, category);
CREATE INDEX idx_catalog_attributes ON catalog_items USING GIN (attributes);
CREATE INDEX idx_catalog_tags ON catalog_items USING GIN (tags);

-- Schema definition: what attributes mean for each tenant
CREATE TABLE catalog_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('number','text','enum','boolean')),
    field_label TEXT NOT NULL,
    options JSONB,
    filterable BOOLEAN DEFAULT true,
    required BOOLEAN DEFAULT false,
    UNIQUE(tenant_id, field_name)
);
