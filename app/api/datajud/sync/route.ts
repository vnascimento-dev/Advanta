import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { datajudSearchByNumeroProcesso } from "@/lib/datajud";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

function pickAlias(clientAlias?: string | null, cfgAlias?: string | null) {
  return clientAlias || cfgAlias || "api_publica_tjmt";
}

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN" as Role, "ADVOGADO" as Role, "ASSISTENTE" as Role, "LEITURA" as Role]);

    const { clientId } = await req.json();
    if (!clientId) return NextResponse.json({ error: "clientId é obrigatório" }, { status: 400 });

    const [client, cfg] = await Promise.all([
      prisma.client.findUnique({ where: { id: String(clientId) } }),
      prisma.pjeConfig.findUnique({ where: { id: "main" } }),
    ]);

    if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

    const apiKey = cfg?.datajudApiKey || "";
    if (!apiKey) {
      return NextResponse.json({
        error: "Datajud não configurado. Vá em Configurações > PJe e informe a API Key do Datajud.",
      }, { status: 400 });
    }

    const numeroProcesso = client.idProcesso || "";
    if (!numeroProcesso) return NextResponse.json({ error: "Cliente sem ID Processo (CNJ)" }, { status: 400 });

    const alias = pickAlias(client.datajudAlias, cfg?.datajudDefaultAlias);

    const data = await datajudSearchByNumeroProcesso({ apiKey, alias, numeroProcesso });
    const hit = data?.hits?.hits?.[0];
    const src = hit?._source;

    if (!src) {
      return NextResponse.json({
        ok: true,
        meta: { tribunal: null, numeroProcesso: null, nivelSigilo: null },
        movements: [],
      });
    }

    const movimentos: any[] = Array.isArray(src.movimentos) ? src.movimentos : [];

    // Upsert simples (evita duplicidade pelo unique clientId+codigo+dataHora)
    const ops = movimentos.slice(0, 300).flatMap((m) => {
      const codigo = Number(m?.codigo || 0);
      const nome = String(m?.nome || "").slice(0, 255);
      const dataHora = m?.dataHora ? new Date(m.dataHora) : null;
      if (!codigo || !nome || !dataHora || Number.isNaN(dataHora.getTime())) return [];

      const orgaoNome = m?.orgaoJulgador?.nomeOrgao || m?.orgaoJulgador?.nome || null;
      const complementos = m?.complementosTabelados ? JSON.stringify(m.complementosTabelados) : null;

      return [
        prisma.datajudMovement.upsert({
          where: {
            clientId_codigo_dataHora: {
              clientId: client.id,
              codigo,
              dataHora,
            },
          },
          create: {
            clientId: client.id,
            codigo,
            nome,
            dataHora,
            orgaoNome,
            complementosJson: complementos,
          },
          update: {
            nome,
            orgaoNome,
            complementosJson: complementos,
          },
        }),
      ];
    });

    if (ops.length) await prisma.$transaction(ops);

    const saved = await prisma.datajudMovement.findMany({
      where: { clientId: client.id },
      orderBy: { dataHora: "desc" },
      take: 50,
    });

    return NextResponse.json({
      ok: true,
      meta: {
        tribunal: src?.tribunal || null,
        numeroProcesso: src?.numeroProcesso || null,
        nivelSigilo: typeof src?.nivelSigilo === "number" ? src.nivelSigilo : null,
      },
      movements: saved.map((m) => ({
        codigo: m.codigo,
        nome: m.nome,
        dataHora: m.dataHora.toISOString(),
        orgaoNome: m.orgaoNome,
      })),
    });
  } catch (e: any) {
    const msg = e?.message || "Erro inesperado";
    const status = msg === "UNAUTHENTICATED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
