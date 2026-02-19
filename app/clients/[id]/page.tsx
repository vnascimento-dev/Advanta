import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SensitiveField from "@/app/clients/_components/SensitiveField";
import DatajudPanel from "@/app/clients/_components/DatajudPanel";

export const dynamic = "force-dynamic";

function fmtDate(dt?: Date | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("pt-BR");
}

function fmtDateTime(dt?: Date | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("pt-BR");
}

export default async function ClientViewPage({ params }: { params: { id: string } }) {
  const c = await prisma.client.findUnique({ where: { id: params.id } });

  if (!c) {
    return (
      <div className="container-fluid">
        <div className="card">
          <div className="card-body">
            <h1 className="h5 mb-3">Cliente não encontrado</h1>
            <Link className="btn btn-outline-secondary" href="/clients">
              Voltar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const datajudMovements = await prisma.datajudMovement.findMany({
    where: { clientId: c.id },
    orderBy: { dataHora: "desc" },
    take: 50,
  });

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Cliente</h1>
          <div className="text-muted small">Detalhes do cadastro e prazos</div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <a
            className="btn btn-outline-secondary"
            href={`/api/clients/${c.id}/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Baixar PDF
          </a>
          <Link className="btn btn-outline-secondary" href={`/clients/${c.id}/edit`}>
            Editar
          </Link>
          <Link className="btn btn-outline-secondary" href="/clients">
            Voltar
          </Link>
        </div>
      </div>

      <div className="row g-3">
        {/* Card: Cliente */}
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div>
                  <div className="text-muted small">Cliente</div>
                  <div className="fw-bold fs-5">{c.name}</div>
                  <div className="text-muted small">{c.email ?? "—"}</div>
                  <div className="text-muted small">{c.whatsapp ?? "—"}</div>
                </div>
                <span className="badge text-bg-secondary">ID: {c.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Identificação */}
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">Identificação</div>

              <div className="d-flex flex-column gap-2">
                <SensitiveField label="CPF" value={c.cpf ?? ""} />
                <SensitiveField label="Senha Gov.br" value={c.senhaGovBr ?? ""} isPassword />
              </div>

              <div className="text-muted small mt-2">
                Campos sensíveis podem ser exibidos/ocultados conforme permissões.
              </div>
            </div>
          </div>
        </div>

        {/* Card: Processo */}
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">Processo</div>

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <div className="text-muted small">Advogado</div>
                  <div className="fw-semibold">{c.advogado ?? "—"}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted small">Prioridade</div>
                  <span className="badge text-bg-secondary">{c.prioridade}</span>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted small">Status</div>
                  <div className="fw-semibold">{c.status ?? "—"}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted small">ID Processo</div>
                  <div className="text-muted">{c.idProcesso ?? "—"}</div>
                </div>

                <div className="col-12">
                  <div className="text-muted small">Tipo</div>
                  <div className="text-muted">{c.tipo ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Prazos */}
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">Prazos</div>

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <div className="text-muted small">Data</div>
                  <div className="fw-semibold">{fmtDate(c.data)}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted small">Audiência</div>
                  <div className="fw-semibold">{fmtDateTime(c.dataAudiencia)}</div>
                </div>

                <div className="col-12">
                  <div className="text-muted small">Link detalhes</div>
                  {c.linkDetalhes ? (
                    <a href={c.linkDetalhes} target="_blank" rel="noreferrer">
                      abrir
                    </a>
                  ) : (
                    <div className="text-muted">—</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card: Atividade */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small mb-2">Atividade</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{c.atividade ?? "—"}</div>
            </div>
          </div>
        </div>

        {/* Card: Datajud */}
        <div className="col-12">
          <DatajudPanel
            clientId={c.id}
            hasProcessNumber={!!c.idProcesso}
            initialMovements={datajudMovements.map((m) => ({
              codigo: m.codigo,
              nome: m.nome,
              dataHora: m.dataHora.toISOString(),
              orgaoNome: m.orgaoNome,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
