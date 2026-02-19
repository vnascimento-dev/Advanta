import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { datajudSearchByNumeroProcesso } from "@/lib/datajud";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireRole(["ADMIN" as Role]);
    const cfg = await prisma.pjeConfig.findUnique({ where: { id: "main" } });
    const apiKey = cfg?.datajudApiKey || "";
    const alias = cfg?.datajudDefaultAlias || "api_publica_tjmt";
    if (!apiKey) return NextResponse.json({ ok: false, error: "API Key não configurada" }, { status: 400 });

    // CNJ impossível apenas para validar autenticação (deve retornar 200 e 0 hits)
    const resp = await datajudSearchByNumeroProcesso({ apiKey, alias, numeroProcesso: "00000000000000000000" });
    const hits = resp?.hits?.total?.value ?? resp?.hits?.hits?.length ?? 0;
    return NextResponse.json({ ok: true, alias, hits });
  } catch (e: any) {
    const msg = e?.message || "Erro inesperado";
    const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
