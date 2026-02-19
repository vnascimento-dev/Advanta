import { prisma } from "@/lib/prisma";
import HearingBell from "./HearingBell";

export const dynamic = "force-dynamic";

function fmt(dt?: Date | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("pt-BR");
}

function daysUntil(dt: Date) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(dt);
  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000); // 24*60*60*1000
}


function badgeClassByDays(d: number) {
  if (d <= 1) return "text-bg-danger";
  if (d === 2) return "text-bg-warning"; // sem laranja no bootstrap padrão
  if (d === 3) return "text-bg-warning";
  return "text-bg-success"; // 4+ dias
}

function badgeTextByDays(d: number) {
  if (d <= 0) return "Hoje";
  if (d === 1) return "1 dia";
  return `${d} dias`;
}

export default async function InicioPage() {
  const now = new Date();
  const in3days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // ✅ Buscar tudo em paralelo
  const [
    clientsCount,
    processesCount,
    openTasksCount,
    overdueTasksCount,
    dueSoonTasks,
    hearingsNext7d, // (opcional) se você quiser manter a tabela Hearing no futuro
    hearingsFromClients,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.process.count(),

    prisma.task.count({
      where: { status: { in: ["ABERTA", "EM_ANDAMENTO"] } },
    }),

    prisma.task.count({
      where: {
        status: { in: ["ABERTA", "EM_ANDAMENTO"] },
        dueAt: { lt: now },
      },
    }),

    prisma.task.findMany({
      where: {
        status: { in: ["ABERTA", "EM_ANDAMENTO"] },
        dueAt: { gte: now, lte: in3days },
      },
      orderBy: { dueAt: "asc" },
      take: 10,
      include: { process: { include: { client: true } } },
    }),

    prisma.hearing.findMany({
      where: { scheduledAt: { gte: now, lte: in7days } },
      orderBy: { scheduledAt: "asc" },
      take: 20,
      include: { process: { include: { client: true } } },
    }),

    prisma.client.findMany({
      where: { dataAudiencia: { gte: now, lte: in7days } },
      orderBy: { dataAudiencia: "asc" },
      take: 20,
    }),
  ]);

  // ✅ O alerta agora deve considerar as audiências do CLIENTE
  const hasAlerts =
    overdueTasksCount > 0 ||
    dueSoonTasks.length > 0 ||
    hearingsFromClients.length > 0;

  // ✅ dados pro sino (client component)
  const hearingsForClient = hearingsFromClients
    .filter((c) => c.dataAudiencia)
    .map((c) => ({
      id: c.id,
      scheduledAt: c.dataAudiencia!.toISOString(),
      location: null,
      process: {
        cnjNumber: c.idProcesso ?? "—",
        client: { name: c.name },
      },
    }));

  return (
    <div className="container-fluid">
      {/* Topo com sino */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <div className="fw-bold fs-5">Painel</div>
          <div className="text-muted small">Visão geral e alertas</div>
        </div>

        <HearingBell hearings={hearingsForClient} />
      </div>

      {/* KPIs */}
      <div className="row g-2" style={{ marginTop: 12 }}>
        <div className="col-12 col-md-3">
          <div className="card p-3">
            <div className="text-muted small">Clientes</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{clientsCount}</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card p-3">
            <div className="text-muted small">Processos</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{processesCount}</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card p-3">
            <div className="text-muted small">Tarefas abertas</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{openTasksCount}</div>
          </div>
        </div>

        <div className="col-12 col-md-3">
          <div className="card p-3">
            <div className="text-muted small">Tarefas vencidas</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{overdueTasksCount}</div>
          </div>
        </div>
      </div>

      {/* ALERTAS */}
      {hasAlerts ? (
        <div className="card mt-3">
          <div className="card-body">
            <div className="fw-semibold mb-2">⚠ Alertas</div>

            {dueSoonTasks.length > 0 && (
              <>
                <div className="text-muted small mt-2">
                  Tarefas vencendo em até 3 dias:
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Vencimento</th>
                        <th>Tarefa</th>
                        <th>Processo</th>
                        <th>Cliente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dueSoonTasks.map((t) => (
                        <tr key={t.id}>
                          <td>{fmt(t.dueAt)}</td>
                          <td>{t.title}</td>
                          <td className="text-muted">{t.process.cnjNumber}</td>
                          <td>{t.process.client.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ✅ Audiências vindas da TABELA CLIENT */}
            {hearingsFromClients.length > 0 ? (
              <>
                <div className="text-muted small mt-3">
                  Audiências (por cliente) nos próximos 7 dias:
                </div>

                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Em</th>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Advogado</th>
                        <th>Status</th>
                        <th>ID Processo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hearingsFromClients.map((c) => {
                        const d = c.dataAudiencia ? daysUntil(c.dataAudiencia) : 999;
                        const cls = badgeClassByDays(d);
                        const textDark = d === 2 || d === 3;

                        return (
                          <tr key={c.id}>
                            <td>
                              <span className={`badge ${cls} ${textDark ? "text-dark" : ""}`}>
                                {badgeTextByDays(d)}
                              </span>
                            </td>
                            <td>{fmt(c.dataAudiencia)}</td>
                            <td>{c.name}</td>
                            <td className="text-muted">{c.advogado ?? "—"}</td>
                            <td className="text-muted">{c.status ?? "—"}</td>
                            <td className="text-muted">{c.idProcesso ?? "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}

            {/* (Opcional) manter também as audiências da tabela Hearing, se quiser */}
            {hearingsNext7d.length > 0 ? (
              <div className="text-muted small mt-3">
                (Info) Há registros na tabela Hearing também: {hearingsNext7d.length}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="card mt-3">
          <div className="card-body">
            <div className="text-muted small">✅ Nenhum alerta de prazo no momento.</div>
          </div>
        </div>
      )}
    </div>
  );
}
