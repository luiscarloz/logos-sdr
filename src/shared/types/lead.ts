export type LeadStatus =
  | 'new'
  | 'qualifying'
  | 'qualified'
  | 'nurturing'
  | 'scheduled'
  | 'handed_off'
  | 'lost';

export type ScoreLabel = 'cold' | 'warm' | 'hot';

export interface Lead {
  id: string;
  tenant_id: string;
  external_id: string | null;
  phone: string | null;
  email: string | null;
  name: string | null;
  source: string | null;
  status: LeadStatus;
  score: number;
  score_label: ScoreLabel;
  profile: Record<string, unknown>;
  tags: string[];
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}
