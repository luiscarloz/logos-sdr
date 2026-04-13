import OpenAI from 'openai';
import {
  LLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
} from '../llm-provider.interface.js';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor(
    private apiKey: string,
    private model: string,
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const messages = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature ?? 0.7,
      response_format: request.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    });

    const choice = response.choices[0];

    return {
      content: choice?.message?.content ?? '',
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
      finishReason: choice?.finish_reason ?? 'unknown',
    };
  }
}
