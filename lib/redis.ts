import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 5000,
    keepAlive: 30000,
  });

redis.on("error", (err) => {
  if (process.env.NODE_ENV === "development") console.error("[redis] error:", err?.message ?? err);
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
