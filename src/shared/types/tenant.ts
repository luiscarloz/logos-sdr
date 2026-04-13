export type Industry = 'real_estate' | 'english_school' | 'law_firm';
export type LLMProviderType = 'anthropic' | 'openai' | 'gemini';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  industry: Industry;
  api_key: string;
  llm_provider: LLMProviderType;
  llm_model: string;
  llm_api_key: string;
  config: Record<string, unknown>;
  system_prompt: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantPrompt {
  id: string;
  tenant_id: string;
  step: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
}

export interface TenantChannel {
  id: string;
  tenant_id: string;
  channel_type: string;
  config: Record<string, unknown>;
  active: boolean;
  created_at: string;
}
