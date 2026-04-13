-- Scoring rules per tenant
CREATE TABLE scoring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    condition JSONB NOT NULL,
    points INTEGER NOT NULL,
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scoring_rules_tenant ON scoring_rules(tenant_id, active);

-- Score thresholds for hot/warm/cold labels
CREATE TABLE scoring_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hot_min INTEGER NOT NULL DEFAULT 70,
    warm_min INTEGER NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
