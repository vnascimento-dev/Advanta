import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const me = await requireRole(["ADMIN" as Role]);
    const body = await req.json();

    const apiKey = String(body?.apiKey || "").trim() || null;
    const defaultAlias = String(body?.defaultAlias || "").trim() || null;

    await prisma.pjeConfig.upsert({
      where: { id: "main" },
      create: {
        id: "main",
        datajudApiKey: apiKey,
        datajudDefaultAlias: defaultAlias,
        updatedById: me.id,
      },
      update: {
        datajudApiKey: apiKey,
        datajudDefaultAlias: defaultAlias,
        updatedById: me.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message || "Erro inesperado";
    const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
