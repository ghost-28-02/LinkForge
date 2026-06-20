import { createClient } from 'redis';
import { config } from './env.js';

export const redis = createClient({ url: config.redisUrl });

redis.on('error', (err) => console.error('[redis] error:', err.message));
redis.on('connect', () => console.log('[redis] connected'));

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}
