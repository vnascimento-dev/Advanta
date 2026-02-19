import { redis } from "./redis";

export async function rateLimit(key: string, opts?: { rps?: number; burst?: number }) {
  const rps = Number(opts?.rps ?? process.env.RATE_LIMIT_RPS ?? 5);
  const burst = Number(opts?.burst ?? process.env.RATE_LIMIT_BURST ?? 10);

  const bucketKey = `rl:${key}`;
  const now = Date.now();

  await redis.connect().catch(() => undefined);

  const lua = `
local k = KEYS[1]
local rps = tonumber(ARGV[1])
local burst = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local tokens = tonumber(redis.call("HGET", k, "tokens"))
local last = tonumber(redis.call("HGET", k, "last"))

if tokens == nil then tokens = burst end
if last == nil then last = now end

local delta = math.max(0, now - last) / 1000.0
tokens = math.min(burst, tokens + (delta * rps))

local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

redis.call("HSET", k, "tokens", tokens)
redis.call("HSET", k, "last", now)
redis.call("EXPIRE", k, 60)

return {allowed, tokens}
`;

  const res = (await redis.eval(lua, 1, bucketKey, String(rps), String(burst), String(now))) as [number, number];
  return { allowed: res[0] === 1, remaining: Math.floor(res[1] ?? 0) };
}
