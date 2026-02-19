import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProcess } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function ProcessesPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = (searchParams?.q ?? "").trim();
  const processes = await prisma.process.findMany({
    where: q
      ? { OR: [
          { cnjNumber: { contains: q } },
          { tribunal: { contains: q } },
          { classe: { contains: q } },
          { assunto: { contains: q } },
          { client: { name: { contains: q } } },
        ] }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { client: true, tasks: true, hearings: true },
  });

  return (
    <div className="card">
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <h1>Processos</h1>
        <Link className="btn btn-dark" href="/processes/new">Novo</Link>
      </div>

      <form className="d-flex flex-wrap gap-2 align-items-center" action="/processes" method="get" style={{ marginBottom: 10 }}>
        <input className="form-control" name="q" placeholder="Buscar por CNJ, cliente, tribunal, assunto..." defaultValue={q} />
        <button className="btn btn-outline-secondary" type="submit">Buscar</button>
      </form>

      <table className="table table-sm">
        <thead>
          <tr>
            <th>Processo</th>
            <th>Cliente</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Tarefas</th>
            <th>Audiências</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.id}>
              <td>
                <div style={{ fontWeight: 800 }}>{p.cnjNumber}</div>
                <div className="text-muted small">
                  {p.tribunal ?? "—"} {p.classe ? `• ${p.classe}` : ""} {p.assunto ? `• ${p.assunto}` : ""}
                </div>
              </td>
              <td className="text-muted small">{p.client.name}</td>
              <td><span className="badge text-bg-light">{p.status}</span></td>
              <td><span className="badge text-bg-light">{p.prioridade}</span></td>
              <td className="text-muted small">{p.tasks.length}</td>
              <td className="text-muted small">{p.hearings.length}</td>
              <td style={{ textAlign: "right" }}>
                <form action={async () => { "use server"; await deleteProcess(p.id); }}>
                  <button className="btn btn-outline-danger" type="submit">Excluir</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {processes.length === 0 && <div className="text-muted small">Nenhum processo encontrado.</div>}
    </div>
  );
}
