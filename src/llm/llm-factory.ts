import { LLMProvider } from './llm-provider.interface.js';
import { AnthropicProvider } from './providers/anthropic.provider.js';
import { OpenAIProvider } from './providers/openai.provider.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { AppError } from '../shared/errors/index.js';

export class LLMFactory {
  private cache = new Map<string, LLMProvider>();

  create(provider: string, model: string, apiKey: string): LLMProvider {
    const cacheKey = `${provider}:${model}:${apiKey.slice(-8)}`;

    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    let instance: LLMProvider;

    switch (provider) {
      case 'anthropic':
        instance = new AnthropicProvider(apiKey, model);
        break;
      case 'openai':
        instance = new OpenAIProvider(apiKey, model);
        break;
      case 'gemini':
        instance = new GeminiProvider(apiKey, model);
        break;
      default:
        throw new AppError(`Unknown LLM provider: ${provider}`, 400);
    }

    this.cache.set(cacheKey, instance);
    return instance;
  }
}
