import { inject, injectable } from 'tsyringe';
import { ConversationRepository } from './conversation.repository.js';
import { LeadRepository } from '../lead/lead.repository.js';
import { TenantRepository } from '../tenant/tenant.repository.js';
import { PromptBuilder } from './prompt/prompt-builder.js';
import { LLMFactory } from '../../llm/llm-factory.js';
import { parseSDRResponse, SDRResponse } from '../../llm/llm-response.parser.js';
import { resolveNextStep } from './flow/flow-steps.js';
import { InboundMessage, OutboundMessage } from '../../shared/types/channel.js';
import { Conversation, Message } from '../../shared/types/conversation.js';
import { Tenant } from '../../shared/types/tenant.js';
import { Lead } from '../../shared/types/lead.js';
import { ScoringEngine } from '../scoring/scoring.engine.js';
import { Logger } from '../../shared/utils/logger.js';

@injectable()
export class ConversationService {
  private llmFactory = new LLMFactory();

  constructor(
    @inject(ConversationRepository) private conversationRepo: ConversationRepository,
    @inject(LeadRepository) private leadRepo: LeadRepository,
    @inject(TenantRepository) private tenantRepo: TenantRepository,
    @inject(PromptBuilder) private promptBuilder: PromptBuilder,
    @inject(ScoringEngine) private scoringEngine: ScoringEngine,
    @inject('Logger') private logger: Logger,
  ) {}

  async handleMessage(inbound: InboundMessage): Promise<OutboundMessage> {
    const tenant = await this.tenantRepo.findById(inbound.tenantId);

    // Find or create lead
    const { lead, created } = await this.leadRepo.findOrCreate(
      tenant.id,
      inbound.senderPhone ?? inbound.channelMessageId,
      { name: inbound.senderName ?? null, source: inbound.channelType },
    );

    if (created) {
      this.logger.info({ leadId: lead.id, tenantId: tenant.id }, 'New lead created from message');
    }

    // Find or create conversation
    let conversation = await this.conversationRepo.findActiveByLeadAndChannel(
      lead.id,
      inbound.channelType,
    );

    if (!conversation) {
      conversation = await this.conversationRepo.create({
        tenant_id: tenant.id,
        lead_id: lead.id,
        channel_type: inbound.channelType,
        channel_id: inbound.channelMessageId,
        current_step: 'greeting',
        step_data: {},
        context: {},
        status: 'active',
        last_message_at: new Date().toISOString(),
      });
    }

    // Save inbound message
    await this.conversationRepo.addMessage({
      conversation_id: conversation.id,
      role: 'lead',
      content: inbound.content,
      metadata: { channelMessageId: inbound.channelMessageId },
    });

    // Get conversation history
    const messages = await this.conversationRepo.getRecentMessages(conversation.id, 15);

    // Build prompt and call LLM
    const sdrResponse = await this.callLLM(tenant, lead, conversation, messages);

    // Process response: update lead profile, score, step
    conversation = await this.processResponse(sdrResponse, tenant, lead, conversation);

    // Save assistant message
    await this.conversationRepo.addMessage({
      conversation_id: conversation.id,
      role: 'assistant',
      content: sdrResponse.reply,
      metadata: {
        intent: sdrResponse.intent,
        step: conversation.current_step,
      },
    });

    // Update last message timestamp
    await this.conversationRepo.update(conversation.id, {
      last_message_at: new Date().toISOString(),
    });

    return {
      channelType: inbound.channelType,
      recipientPhone: inbound.senderPhone,
      content: sdrResponse.reply,
      metadata: {
        conversationId: conversation.id,
        leadId: lead.id,
        step: conversation.current_step,
        intent: sdrResponse.intent,
      },
    };
  }

  private async callLLM(
    tenant: Tenant,
    lead: Lead,
    conversation: Conversation,
    messages: Message[],
  ): Promise<SDRResponse> {
    const llmProvider = this.llmFactory.create(
      tenant.llm_provider,
      tenant.llm_model,
      tenant.llm_api_key,
    );

    const prompt = await this.promptBuilder.build({
      tenant,
      lead,
      conversation,
      messages,
      currentStep: conversation.current_step,
    });

    const response = await llmProvider.complete({
      messages: prompt.messages,
      temperature: prompt.temperature,
      maxTokens: prompt.maxTokens,
      responseFormat: 'json',
    });

    return parseSDRResponse(response.content, this.logger);
  }

  private async processResponse(
    sdrResponse: SDRResponse,
    tenant: Tenant,
    lead: Lead,
    conversation: Conversation,
  ): Promise<Conversation> {
    // Update lead profile with extracted data
    if (Object.keys(sdrResponse.extracted_data).length > 0) {
      await this.leadRepo.updateProfile(lead.id, sdrResponse.extracted_data);
    }

    // Update lead name if extracted
    if (sdrResponse.extracted_data.name && !lead.name) {
      await this.leadRepo.update(lead.id, {
        name: sdrResponse.extracted_data.name as string,
      });
    }

    // Resolve next step
    const nextStep = resolveNextStep(
      conversation.current_step,
      sdrResponse.suggested_next_step,
    );

    if (nextStep !== conversation.current_step) {
      this.logger.info(
        {
          conversationId: conversation.id,
          from: conversation.current_step,
          to: nextStep,
        },
        'Conversation step transition',
      );

      // Update lead status based on step
      const statusMap: Record<string, string> = {
        qualification: 'qualifying',
        needs_discovery: 'qualifying',
        recommendation: 'qualified',
        scheduling: 'qualified',
        handoff: 'handed_off',
        nurturing: 'nurturing',
      };

      const newStatus = statusMap[nextStep];
      if (newStatus) {
        await this.leadRepo.update(lead.id, { status: newStatus as Lead['status'] });
      }
    }

    // Update scoring based on signals from LLM
    if (Object.keys(sdrResponse.score_signals).length > 0) {
      const scoreResult = await this.scoringEngine.evaluateSignals(
        tenant.id,
        lead.score,
        sdrResponse.score_signals,
      );
      await this.leadRepo.update(lead.id, {
        score: scoreResult.score,
        score_label: scoreResult.label,
      });
      this.logger.info(
        { leadId: lead.id, score: scoreResult.score, label: scoreResult.label },
        'Lead score updated',
      );
    }

    // Update conversation step and context
    const updatedContext = {
      ...conversation.context,
      last_intent: sdrResponse.intent,
      last_score_signals: sdrResponse.score_signals,
    };

    return this.conversationRepo.update(conversation.id, {
      current_step: nextStep,
      context: updatedContext,
    });
  }

  // Direct API: get conversation state
  async getConversation(id: string) {
    const conversation = await this.conversationRepo.findById(id);
    const messages = await this.conversationRepo.getMessages(conversation.id);
    return { conversation, messages };
  }
}
