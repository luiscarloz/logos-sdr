-- Tenants: each client company using the SDR platform
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    industry TEXT NOT NULL CHECK (industry IN ('real_estate', 'english_school', 'law_firm')),
    api_key TEXT UNIQUE NOT NULL,
    llm_provider TEXT NOT NULL DEFAULT 'gemini' CHECK (llm_provider IN ('anthropic', 'openai', 'gemini')),
    llm_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    llm_api_key TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    system_prompt TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Per-step prompt overrides for each tenant
CREATE TABLE tenant_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    temperature NUMERIC(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1024,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tenant_id, step)
);

-- Channel configurations per tenant
CREATE TABLE tenant_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    channel_type TEXT NOT NULL CHECK (channel_type IN ('whatsapp', 'rest', 'webchat')),
    config JSONB NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_channels_tenant ON tenant_channels(tenant_id);
