export interface ScoringRule {
  id: string;
  tenant_id: string;
  rule_name: string;
  condition: {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'exists';
    value: unknown;
  };
  points: number;
  priority: number;
  active: boolean;
  created_at: string;
}

export interface ScoringThreshold {
  id: string;
  tenant_id: string;
  hot_min: number;
  warm_min: number;
  created_at: string;
}

export interface ScoreResult {
  score: number;
  label: 'hot' | 'warm' | 'cold';
}
