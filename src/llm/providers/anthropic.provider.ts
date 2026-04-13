import Anthropic from '@anthropic-ai/sdk';
import {
  LLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
} from '../llm-provider.interface.js';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor(
    private apiKey: string,
    private model: string,
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const conversationMessages = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature ?? 0.7,
      system: systemMessage?.content ?? '',
      messages: conversationMessages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');

    return {
      content: textBlock?.text ?? '',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      finishReason: response.stop_reason ?? 'unknown',
    };
  }
}
