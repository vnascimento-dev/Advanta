import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PjeCertConfigForm from "./PjeCertConfigForm";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function PjeConfigPage() {
  await requireRole(["ADMIN" as Role]);
  const cfg = await prisma.pjeConfig.findUnique({ where: { id: "main" } });

  return (
    <div className="card p-3" style={{ maxWidth: 1100 }}>
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div>
          <h1 className="mb-0">Configurações • PJe</h1>
          <div className="text-muted small">Somente administradores podem alterar integrações e certificado.</div>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <Link className="btn btn-outline-secondary" href="/pje">Voltar</Link>
          <Link className="btn btn-outline-secondary" href="/inicio">Início</Link>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <PjeCertConfigForm
          currentFilename={cfg?.certFilename || null}
          currentDatajudApiKey={cfg?.datajudApiKey || null}
          currentDatajudDefaultAlias={cfg?.datajudDefaultAlias || "api_publica_tjmt"}
        />
      </div>

      <div className="text-muted small" style={{ marginTop: 12 }}>
        Dica: no servidor Linux, defina <code>PJE_MASTER_KEY</code> (e guarde fora do repositório) para manter a senha do A1 protegida.
      </div>
    </div>
  );
}
