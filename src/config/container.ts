import 'reflect-metadata';
import { container } from 'tsyringe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from './env.js';
import { createLogger, Logger } from '../shared/utils/logger.js';

export function setupContainer() {
  const env = getEnv();

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  container.register<SupabaseClient>('SupabaseClient', { useValue: supabase });

  const logger = createLogger(env.LOG_LEVEL);
  container.register<Logger>('Logger', { useValue: logger });

  container.register('Env', { useValue: env });

  return container;
}
