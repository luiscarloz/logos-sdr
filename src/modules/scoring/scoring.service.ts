import { inject, injectable } from 'tsyringe';
import { SupabaseClient } from '@supabase/supabase-js';
import { ScoringEngine } from './scoring.engine.js';
import { ScoringRule, ScoringThreshold, ScoreResult } from '../../shared/types/scoring.js';

@injectable()
export class ScoringService {
  constructor(
    @inject(ScoringEngine) private engine: ScoringEngine,
    @inject('SupabaseClient') private db: SupabaseClient,
  ) {}

  async evaluateLead(
    tenantId: string,
    leadProfile: Record<string, unknown>,
  ): Promise<ScoreResult> {
    return this.engine.evaluate(tenantId, leadProfile);
  }

  async evaluateSignals(
    tenantId: string,
    currentScore: number,
    signals: Record<string, boolean>,
  ): Promise<ScoreResult> {
    return this.engine.evaluateSignals(tenantId, currentScore, signals);
  }

  // CRUD for scoring rules
  async createRule(
    tenantId: string,
    ruleName: string,
    condition: ScoringRule['condition'],
    points: number,
    priority = 0,
  ): Promise<ScoringRule> {
    const { data, error } = await this.db
      .from('scoring_rules')
      .insert({ tenant_id: tenantId, rule_name: ruleName, condition, points, priority })
      .select()
      .single();

    if (error) throw new Error(`Failed to create scoring rule: ${error.message}`);
    return data as ScoringRule;
  }

  async getRules(tenantId: string): Promise<ScoringRule[]> {
    const { data } = await this.db
      .from('scoring_rules')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('priority', { ascending: false });

    return (data ?? []) as ScoringRule[];
  }

  async setThresholds(
    tenantId: string,
    hotMin: number,
    warmMin: number,
  ): Promise<ScoringThreshold> {
    const { data, error } = await this.db
      .from('scoring_thresholds')
      .upsert({ tenant_id: tenantId, hot_min: hotMin, warm_min: warmMin })
      .select()
      .single();

    if (error) throw new Error(`Failed to set thresholds: ${error.message}`);
    return data as ScoringThreshold;
  }
}
