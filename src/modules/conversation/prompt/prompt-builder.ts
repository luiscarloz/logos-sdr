import { inject, injectable } from 'tsyringe';
import { TenantRepository } from '../../tenant/tenant.repository.js';
import { Tenant, TenantPrompt } from '../../../shared/types/tenant.js';
import { Lead } from '../../../shared/types/lead.js';
import { Conversation, Message } from '../../../shared/types/conversation.js';
import { LLMMessage } from '../../../llm/llm-provider.interface.js';
import { BASE_SYSTEM_PROMPT, STEP_PROMPTS } from './prompt-templates.js';

@injectable()
export class PromptBuilder {
  constructor(@inject(TenantRepository) private tenantRepo: TenantRepository) {}

  async build(params: {
    tenant: Tenant;
    lead: Lead;
    conversation: Conversation;
    messages: Message[];
    currentStep: string;
    catalogResults?: string;
    availableSlots?: string;
  }): Promise<{ messages: LLMMessage[]; temperature: number; maxTokens: number }> {
    const { tenant, lead, conversation, messages, currentStep, catalogResults, availableSlots } =
      params;

    // Get tenant-specific prompt for this step (if exists)
    const tenantPrompt = await this.tenantRepo.getPromptByStep(tenant.id, currentStep);

    const systemPrompt = this.assembleSystemPrompt(
      tenant,
      tenantPrompt,
      currentStep,
      lead,
      conversation,
      catalogResults,
      availableSlots,
    );

    const llmMessages: LLMMessage[] = [{ role: 'system', content: systemPrompt }];

    // Add conversation history
    for (const msg of messages) {
      llmMessages.push({
        role: msg.role === 'lead' ? 'user' : msg.role === 'assistant' ? 'assistant' : 'system',
        content: msg.content,
      });
    }

    return {
      messages: llmMessages,
      temperature: tenantPrompt?.temperature ?? 0.7,
      maxTokens: tenantPrompt?.max_tokens ?? 2048,
    };
  }

  private assembleSystemPrompt(
    tenant: Tenant,
    tenantPrompt: TenantPrompt | null,
    currentStep: string,
    lead: Lead,
    conversation: Conversation,
    catalogResults?: string,
    availableSlots?: string,
  ): string {
    const parts: string[] = [];

    // Base SDR instructions
    parts.push(BASE_SYSTEM_PROMPT);

    // Tenant persona/system prompt
    if (tenant.system_prompt) {
      parts.push(`\n--- CONTEXTO DA EMPRESA ---\n${tenant.system_prompt}`);
    }

    // Step-specific prompt (tenant override or default)
    let stepPrompt = tenantPrompt?.system_prompt ?? STEP_PROMPTS[currentStep] ?? '';

    // Inject catalog results and available slots
    if (catalogResults) {
      stepPrompt = stepPrompt.replace('{catalog_results}', catalogResults);
    } else {
      stepPrompt = stepPrompt.replace('{catalog_results}', 'Nenhum item disponível no momento.');
    }

    if (availableSlots) {
      stepPrompt = stepPrompt.replace('{available_slots}', availableSlots);
    } else {
      stepPrompt = stepPrompt.replace(
        '{available_slots}',
        'Pergunte a disponibilidade do lead e informe que irá verificar os horários.',
      );
    }

    parts.push(`\n--- INSTRUÇÕES DA ETAPA ---\n${stepPrompt}`);

    // Lead context
    const leadContext = this.buildLeadContext(lead);
    if (leadContext) {
      parts.push(`\n--- PERFIL DO LEAD ---\n${leadContext}`);
    }

    // Conversation context summary
    if (Object.keys(conversation.context).length > 0) {
      parts.push(
        `\n--- CONTEXTO DA CONVERSA ---\n${JSON.stringify(conversation.context, null, 2)}`,
      );
    }

    return parts.join('\n');
  }

  private buildLeadContext(lead: Lead): string {
    const lines: string[] = [];

    if (lead.name) lines.push(`Nome: ${lead.name}`);
    if (lead.phone) lines.push(`Telefone: ${lead.phone}`);
    if (lead.email) lines.push(`Email: ${lead.email}`);
    if (lead.source) lines.push(`Origem: ${lead.source}`);
    lines.push(`Status: ${lead.status}`);
    lines.push(`Score: ${lead.score} (${lead.score_label})`);

    if (Object.keys(lead.profile).length > 0) {
      lines.push(`Perfil coletado: ${JSON.stringify(lead.profile, null, 2)}`);
    }

    return lines.join('\n');
  }
}
