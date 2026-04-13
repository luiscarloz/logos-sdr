import { inject, injectable } from 'tsyringe';
import { randomBytes } from 'crypto';
import { TenantRepository } from './tenant.repository.js';
import { Tenant, TenantPrompt, TenantChannel, Industry, LLMProviderType } from '../../shared/types/tenant.js';
import { ValidationError } from '../../shared/errors/index.js';
import { Logger } from '../../shared/utils/logger.js';

export interface CreateTenantInput {
  slug: string;
  name: string;
  industry: Industry;
  llm_provider?: LLMProviderType;
  llm_model?: string;
  llm_api_key: string;
  system_prompt?: string;
  config?: Record<string, unknown>;
}

@injectable()
export class TenantService {
  constructor(
    @inject(TenantRepository) private repo: TenantRepository,
    @inject('Logger') private logger: Logger,
  ) {}

  async create(input: CreateTenantInput): Promise<Tenant> {
    const existing = await this.repo.findBySlug(input.slug);
    if (existing) throw new ValidationError(`Tenant with slug "${input.slug}" already exists`);

    const apiKey = `sdr_${randomBytes(32).toString('hex')}`;

    const tenant = await this.repo.create({
      slug: input.slug,
      name: input.name,
      industry: input.industry,
      api_key: apiKey,
      llm_provider: input.llm_provider ?? 'anthropic',
      llm_model: input.llm_model ?? 'claude-sonnet-4-20250514',
      llm_api_key: input.llm_api_key,
      system_prompt: input.system_prompt ?? null,
      config: input.config ?? {},
      active: true,
    });

    this.logger.info({ tenantId: tenant.id, slug: tenant.slug }, 'Tenant created');
    return tenant;
  }

  async getById(id: string): Promise<Tenant> {
    return this.repo.findById(id);
  }

  async getByApiKey(apiKey: string): Promise<Tenant | null> {
    return this.repo.findByApiKey(apiKey);
  }

  async update(id: string, updates: Partial<CreateTenantInput>): Promise<Tenant> {
    return this.repo.update(id, updates);
  }

  async list(): Promise<Tenant[]> {
    return this.repo.list();
  }

  // Prompts
  async getPrompts(tenantId: string): Promise<TenantPrompt[]> {
    return this.repo.getPrompts(tenantId);
  }

  async upsertPrompt(
    tenantId: string,
    step: string,
    systemPrompt: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<TenantPrompt> {
    return this.repo.upsertPrompt({
      tenant_id: tenantId,
      step,
      system_prompt: systemPrompt,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 1024,
    });
  }

  // Channels
  async getChannels(tenantId: string): Promise<TenantChannel[]> {
    return this.repo.getChannels(tenantId);
  }

  async createChannel(
    tenantId: string,
    channelType: string,
    config: Record<string, unknown>,
  ): Promise<TenantChannel> {
    return this.repo.createChannel({
      tenant_id: tenantId,
      channel_type: channelType,
      config,
      active: true,
    });
  }
}
