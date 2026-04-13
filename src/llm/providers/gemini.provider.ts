import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  LLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
} from '../llm-provider.interface.js';

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;

  constructor(
    private apiKey: string,
    private model: string,
  ) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const conversationMessages = request.messages.filter((m) => m.role !== 'system');

    const genModel = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemMessage?.content,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.maxTokens ?? 1024,
        responseMimeType: request.responseFormat === 'json' ? 'application/json' : 'text/plain',
      },
    });

    // Build chat history (all except last user message)
    const history = conversationMessages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = conversationMessages[conversationMessages.length - 1];

    const chat = genModel.startChat({ history });
    const result = await chat.sendMessage(lastMessage?.content ?? '');

    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    return {
      content: text,
      usage: {
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
      },
      finishReason: response.candidates?.[0]?.finishReason ?? 'unknown',
    };
  }
}
