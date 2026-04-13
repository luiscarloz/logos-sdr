import { Logger } from '../shared/utils/logger.js';

export interface SDRResponse {
  reply: string;
  intent: string;
  extracted_data: Record<string, unknown>;
  suggested_next_step: string | null;
  score_signals: Record<string, boolean>;
}

const DEFAULT_RESPONSE: SDRResponse = {
  reply: '',
  intent: 'unknown',
  extracted_data: {},
  suggested_next_step: null,
  score_signals: {},
};

export function parseSDRResponse(raw: string, logger: Logger): SDRResponse {
  // Try to extract JSON from the response (may be wrapped in markdown code blocks)
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    logger.warn({ raw: raw.slice(0, 200) }, 'No JSON found in LLM response, using raw as reply');
    return { ...DEFAULT_RESPONSE, reply: raw.trim() };
  }

  try {
    const parsed = JSON.parse(jsonMatch[1].trim());

    // Clean reply: remove any JSON artifacts that leaked in
    let reply = typeof parsed.reply === 'string' ? parsed.reply : raw.trim();
    reply = reply.replace(/^\s*\{[\s\S]*?"reply"\s*:\s*"/, '').replace(/"\s*[,}]\s*$/, '');

    return {
      reply,
      intent: typeof parsed.intent === 'string' ? parsed.intent : 'unknown',
      extracted_data:
        typeof parsed.extracted_data === 'object' && parsed.extracted_data
          ? parsed.extracted_data
          : {},
      suggested_next_step:
        typeof parsed.suggested_next_step === 'string' ? parsed.suggested_next_step : null,
      score_signals:
        typeof parsed.score_signals === 'object' && parsed.score_signals
          ? parsed.score_signals
          : {},
    };
  } catch (err) {
    logger.warn({ error: err, raw: raw.slice(0, 200) }, 'Failed to parse LLM JSON response');
    return { ...DEFAULT_RESPONSE, reply: raw.trim() };
  }
}
