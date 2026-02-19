import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProcess } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function NewProcessPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" }, take: 1000 });

  return (
    <div className="card">
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <h1>Novo processo</h1>
        <Link className="btn btn-outline-secondary" href="/processes">Voltar</Link>
      </div>

      {clients.length === 0 ? (
        <div className="text-muted small">
          Você precisa cadastrar pelo menos 1 cliente antes. <Link href="/clients/new" className="btn btn-dark">Cadastrar cliente</Link>
        </div>
      ) : (
        <form action={createProcess} className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Cliente *</label>
            <select className="form-select" name="clientId" required>
              {clients.map((c) => (<option value={c.id} key={c.id}>{c.name}</option>))}
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Número CNJ *</label>
            <input className="form-control" name="cnjNumber" required placeholder="0000000-00.0000.0.00.0000" />
          </div>

          <div>
            <label className="label">Tribunal</label>
            <input className="form-control" name="tribunal" placeholder="Ex: TJMT / TRT23" />
          </div>

          <div>
            <label className="label">Classe</label>
            <input className="form-control" name="classe" placeholder="Ex: Ação de ..." />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Assunto</label>
            <input className="form-control" name="assunto" />
          </div>

          <div>
            <label className="label">Status</label>
            <select className="form-select" name="status" defaultValue="ATIVO">
              <option value="ATIVO">ATIVO</option>
              <option value="SUSPENSO">SUSPENSO</option>
              <option value="ARQUIVADO">ARQUIVADO</option>
              <option value="ENCERRADO">ENCERRADO</option>
            </select>
          </div>

          <div>
            <label className="label">Prioridade</label>
            <select className="form-select" name="prioridade" defaultValue="MEDIA">
              <option value="BAIXA">BAIXA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="ALTA">ALTA</option>
              <option value="URGENTE">URGENTE</option>
            </select>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center" style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-dark" type="submit">Salvar</button>
            <Link className="btn btn-outline-secondary" href="/processes">Cancelar</Link>
          </div>
        </form>
      )}
    </div>
  );
}
