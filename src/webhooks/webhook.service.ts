import { inject, injectable } from 'tsyringe';
import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '../shared/utils/logger.js';

export type WebhookEvent =
  | 'lead.created'
  | 'lead.qualified'
  | 'lead.scored'
  | 'appointment.created'
  | 'conversation.handed_off';

interface WebhookSubscription {
  id: string;
  tenant_id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
}

@injectable()
export class WebhookService {
  constructor(
    @inject('SupabaseClient') private db: SupabaseClient,
    @inject('Logger') private logger: Logger,
  ) {}

  async fire(tenantId: string, event: WebhookEvent, payload: Record<string, unknown>) {
    const { data: subscriptions } = await this.db
      .from('webhook_subscriptions')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .contains('events', [event]);

    if (!subscriptions || subscriptions.length === 0) return;

    for (const sub of subscriptions as WebhookSubscription[]) {
      this.sendWebhook(sub, event, payload).catch((err) => {
        this.logger.error(
          { webhookId: sub.id, event, error: err },
          'Webhook delivery failed',
        );
      });
    }
  }

  private async sendWebhook(
    subscription: WebhookSubscription,
    event: WebhookEvent,
    payload: Record<string, unknown>,
    attempt = 1,
  ): Promise<void> {
    const maxRetries = 3;

    try {
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          ...(subscription.secret
            ? { 'X-Webhook-Secret': subscription.secret }
            : {}),
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          data: payload,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        return this.sendWebhook(subscription, event, payload, attempt + 1);
      }

      this.logger.info(
        { webhookId: subscription.id, event, status: response.status },
        'Webhook delivered',
      );
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
        return this.sendWebhook(subscription, event, payload, attempt + 1);
      }
      throw err;
    }
  }
}
