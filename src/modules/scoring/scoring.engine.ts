import { inject, injectable } from 'tsyringe';
import { SupabaseClient } from '@supabase/supabase-js';
import { ScoringRule, ScoringThreshold, ScoreResult } from '../../shared/types/scoring.js';
import { Logger } from '../../shared/utils/logger.js';

@injectable()
export class ScoringEngine {
  constructor(
    @inject('SupabaseClient') private db: SupabaseClient,
    @inject('Logger') private logger: Logger,
  ) {}

  async evaluate(tenantId: string, leadProfile: Record<string, unknown>): Promise<ScoreResult> {
    const rules = await this.getRules(tenantId);
    const thresholds = await this.getThresholds(tenantId);

    let totalScore = 0;

    for (const rule of rules) {
      if (this.evaluateCondition(rule.condition, leadProfile)) {
        totalScore += rule.points;
        this.logger.debug(
          { rule: rule.rule_name, points: rule.points },
          'Scoring rule matched',
        );
      }
    }

    // Clamp score to 0-100
    totalScore = Math.max(0, Math.min(100, totalScore));

    const label =
      totalScore >= thresholds.hot_min
        ? 'hot'
        : totalScore >= thresholds.warm_min
          ? 'warm'
          : 'cold';

    return { score: totalScore, label };
  }

  async evaluateSignals(
    tenantId: string,
    currentScore: number,
    signals: Record<string, boolean>,
  ): Promise<ScoreResult> {
    // Quick scoring based on boolean signals (from LLM response)
    const signalPoints: Record<string, number> = {
      has_budget: 20,
      timeline_urgent: 25,
      has_specific_need: 15,
      decision_maker: 15,
      interested: 10,
      ready_to_schedule: 20,
      not_interested: -30,
      just_browsing: -15,
    };

    let score = currentScore;

    for (const [signal, value] of Object.entries(signals)) {
      if (value && signalPoints[signal]) {
        score += signalPoints[signal];
      }
    }

    score = Math.max(0, Math.min(100, score));

    const thresholds = await this.getThresholds(tenantId);
    const label =
      score >= thresholds.hot_min ? 'hot' : score >= thresholds.warm_min ? 'warm' : 'cold';

    return { score, label };
  }

  private evaluateCondition(
    condition: ScoringRule['condition'],
    profile: Record<string, unknown>,
  ): boolean {
    const value = this.getNestedValue(profile, condition.field);
    if (value === undefined) return condition.operator === 'exists' ? false : false;

    switch (condition.operator) {
      case 'eq':
        return value === condition.value;
      case 'neq':
        return value !== condition.value;
      case 'gt':
        return typeof value === 'number' && value > (condition.value as number);
      case 'gte':
        return typeof value === 'number' && value >= (condition.value as number);
      case 'lt':
        return typeof value === 'number' && value < (condition.value as number);
      case 'lte':
        return typeof value === 'number' && value <= (condition.value as number);
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value as string);
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((curr, key) => {
      if (curr && typeof curr === 'object') return (curr as Record<string, unknown>)[key];
      return undefined;
    }, obj);
  }

  private async getRules(tenantId: string): Promise<ScoringRule[]> {
    const { data } = await this.db
      .from('scoring_rules')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .order('priority', { ascending: false });

    return (data ?? []) as ScoringRule[];
  }

  private async getThresholds(tenantId: string): Promise<ScoringThreshold> {
    const { data } = await this.db
      .from('scoring_thresholds')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    // Default thresholds if none configured
    return (data as ScoringThreshold) ?? { hot_min: 70, warm_min: 40 };
  }
}
