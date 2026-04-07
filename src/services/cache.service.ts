import Redis from "ioredis";
import { env } from "@server/config/env";
import { logger } from "@server/utils/logger";

let redis: Redis | null = null;

function getRedis() {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    redis.on("error", (error) => logger.warn("Redis error", error));
  }
  return redis;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    await client.connect().catch(() => undefined);
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds = 60) {
  try {
    const client = getRedis();
    await client.connect().catch(() => undefined);
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // ignore cache failures
  }
}

export async function invalidateCache(key: string) {
  try {
    const client = getRedis();
    await client.connect().catch(() => undefined);
    await client.del(key);
  } catch {
    // ignore cache failures
  }
}
