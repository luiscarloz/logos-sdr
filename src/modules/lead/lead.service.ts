import { inject, injectable } from 'tsyringe';
import { LeadRepository } from './lead.repository.js';
import { Lead, LeadStatus, ScoreLabel } from '../../shared/types/lead.js';
import { Logger } from '../../shared/utils/logger.js';

export interface CreateLeadInput {
  tenant_id: string;
  phone?: string;
  email?: string;
  name?: string;
  source?: string;
  profile?: Record<string, unknown>;
  tags?: string[];
}

@injectable()
export class LeadService {
  constructor(
    @inject(LeadRepository) private repo: LeadRepository,
    @inject('Logger') private logger: Logger,
  ) {}

  async create(input: CreateLeadInput): Promise<Lead> {
    const lead = await this.repo.create({
      tenant_id: input.tenant_id,
      external_id: null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      name: input.name ?? null,
      source: input.source ?? null,
      status: 'new',
      score: 0,
      score_label: 'cold',
      profile: input.profile ?? {},
      tags: input.tags ?? [],
      assigned_to: null,
    });

    this.logger.info({ leadId: lead.id, tenantId: lead.tenant_id }, 'Lead created');
    return lead;
  }

  async getById(id: string): Promise<Lead> {
    return this.repo.findById(id);
  }

  async findOrCreate(
    tenantId: string,
    phone: string,
    defaults?: Partial<CreateLeadInput>,
  ): Promise<{ lead: Lead; created: boolean }> {
    return this.repo.findOrCreate(tenantId, phone, defaults ?? {});
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return this.repo.update(id, { status });
  }

  async updateScore(id: string, score: number, label: ScoreLabel): Promise<Lead> {
    return this.repo.update(id, { score, score_label: label });
  }

  async updateProfile(id: string, profileUpdates: Record<string, unknown>): Promise<Lead> {
    return this.repo.updateProfile(id, profileUpdates);
  }

  async listByTenant(
    tenantId: string,
    filters?: { status?: string; scoreLabel?: string },
  ): Promise<Lead[]> {
    return this.repo.listByTenant(tenantId, filters);
  }
}
