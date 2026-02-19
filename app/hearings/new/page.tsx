import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createHearing } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function NewHearingPage() {
  const processes = await prisma.process.findMany({
    orderBy: { updatedAt: "desc" },
    take: 500,
    include: { client: true },
  });

  return (
    <div className="card">
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <h1>Nova audiência</h1>
        <Link className="btn btn-outline-secondary" href="/hearings">Voltar</Link>
      </div>

      {processes.length === 0 ? (
        <div className="text-muted small">
          Você precisa cadastrar pelo menos 1 processo antes. <Link href="/processes/new" className="btn btn-dark">Cadastrar processo</Link>
        </div>
      ) : (
        <form action={createHearing} className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Processo *</label>
            <select className="form-select" name="processId" required>
              {processes.map((p) => (
                <option key={p.id} value={p.id}>{p.cnjNumber} • {p.client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data/Hora *</label>
            <input className="form-control" name="scheduledAt" type="datetime-local" required />
          </div>

          <div>
            <label className="label">Local</label>
            <input className="form-control" name="location" placeholder="Ex: Fórum / Sala / Google Meet" />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Link</label>
            <input className="form-control" name="link" placeholder="https://..." />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Observações</label>
            <textarea className="form-control" name="notes" rows={3} />
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center" style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-dark" type="submit">Salvar</button>
            <Link className="btn btn-outline-secondary" href="/hearings">Cancelar</Link>
          </div>
        </form>
      )}
    </div>
  );
}
