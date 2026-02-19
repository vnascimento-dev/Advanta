import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteTask } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    take: 250,
    include: { process: { include: { client: true } } },
  });

  return (
    <div className="card">
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <h1>Prazos / Tarefas</h1>
        <Link className="btn btn-dark" href="/tasks/new">Nova</Link>
      </div>

      <table className="table table-sm">
        <thead>
          <tr>
            <th>Tarefa</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th>Processo</th>
            <th>Cliente</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>
                <div style={{ fontWeight: 800 }}>{t.title}</div>
                <div className="text-muted small">{t.description ? t.description.slice(0, 90) : ""}</div>
              </td>
              <td className="text-muted small">{t.dueAt ? new Date(t.dueAt).toLocaleString("pt-BR") : "—"}</td>
              <td><span className="badge text-bg-light">{t.status}</span></td>
              <td className="text-muted small">{t.process.cnjNumber}</td>
              <td className="text-muted small">{t.process.client.name}</td>
              <td style={{ textAlign: "right" }}>
                <form action={async () => { "use server"; await deleteTask(t.id); }}>
                  <button className="btn btn-outline-danger" type="submit">Excluir</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tasks.length === 0 && <div className="text-muted small">Nenhuma tarefa cadastrada.</div>}
    </div>
  );
}
