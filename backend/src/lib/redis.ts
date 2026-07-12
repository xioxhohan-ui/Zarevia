import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;
const memoryCache = new Map<string, { value: string; expiry: number }>();

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => {
    console.warn('Redis Client Error, falling back to In-Memory Cache:', err);
  });

  redisClient.connect().catch((err) => {
    console.warn('Failed to connect to Redis, using In-Memory Cache fallback:', err.message);
    redisClient = null;
  });
} else {
  console.info('No REDIS_URL provided. Operating with In-Memory Cache fallback.');
}

export const cacheSet = async (key: string, value: any, ttlSeconds = 3600): Promise<void> => {
  const stringVal = JSON.stringify(value);
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.set(key, stringVal, { EX: ttlSeconds });
      return;
    } catch (e) {
      console.error('Redis SET failed, using in-memory backup:', e);
    }
  }
  
  // Memory fallback
  const expiry = Date.now() + ttlSeconds * 1000;
  memoryCache.set(key, { value: stringVal, expiry });
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (redisClient && redisClient.isOpen) {
    try {
      const data = await redisClient.get(key);
      if (data) return JSON.parse(data) as T;
      return null;
    } catch (e) {
      console.error('Redis GET failed, reading in-memory backup:', e);
    }
  }

  // Memory fallback
  const cached = memoryCache.get(key);
  if (cached) {
    if (Date.now() > cached.expiry) {
      memoryCache.delete(key);
      return null;
    }
    return JSON.parse(cached.value) as T;
  }
  return null;
};

export const cacheDel = async (key: string): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.del(key);
      return;
    } catch (e) {
      console.error('Redis DEL failed, deleting from in-memory backup:', e);
    }
  }
  memoryCache.delete(key);
};
