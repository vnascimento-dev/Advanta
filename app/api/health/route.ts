import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { rateLimit } from "@/lib/ratelimit";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimit(`health:${ip}`);
  if (!rl.allowed) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });

  await redis.connect().catch(() => undefined);

  const [clientCount, processCount, redisPing] = await Promise.all([
    prisma.client.count(),
    prisma.process.count(),
    redis.ping().catch(() => "ERR"),
  ]);

  return NextResponse.json({
    ok: true,
    user: { id: session.id, email: session.email, role: session.role },
    mysql: { clients: clientCount, processes: processCount },
    redis: { ping: redisPing },
  });
}
