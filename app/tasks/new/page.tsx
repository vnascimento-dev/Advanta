import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTask } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const processes = await prisma.process.findMany({
    orderBy: { updatedAt: "desc" },
    take: 500,
    include: { client: true },
  });

  return (
    <div className="card">
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <h1>Nova tarefa</h1>
        <Link className="btn btn-outline-secondary" href="/tasks">Voltar</Link>
      </div>

      {processes.length === 0 ? (
        <div className="text-muted small">
          Você precisa cadastrar pelo menos 1 processo antes. <Link href="/processes/new" className="btn btn-dark">Cadastrar processo</Link>
        </div>
      ) : (
        <form action={createTask} className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Processo *</label>
            <select className="form-select" name="processId" required>
              {processes.map((p) => (
                <option key={p.id} value={p.id}>{p.cnjNumber} • {p.client.name}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Título *</label>
            <input className="form-control" name="title" required />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Descrição</label>
            <textarea className="form-control" name="description" rows={3} />
          </div>

          <div>
            <label className="label">Vencimento</label>
            <input className="form-control" name="dueAt" type="datetime-local" />
          </div>

          <div>
            <label className="label">Status</label>
            <select className="form-select" name="status" defaultValue="ABERTA">
              <option value="ABERTA">ABERTA</option>
              <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
              <option value="CONCLUIDA">CONCLUIDA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center" style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-dark" type="submit">Salvar</button>
            <Link className="btn btn-outline-secondary" href="/tasks">Cancelar</Link>
          </div>
        </form>
      )}
    </div>
  );
}
