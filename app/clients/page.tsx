import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { maskCPF } from "@/lib/mask";
import { deleteClient } from "@/app/actions";

export const dynamic = "force-dynamic";

function maskGovPass(v?: string | null) {
  if (!v) return "—";
  const s = String(v);
  if (s.length <= 4) return "****";
  return `${s.slice(0, 2)}****${s.slice(-2)}`;
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: { q?: string; ok?: string; updated?: string; id?: string };
}) {
  const q = (searchParams?.q ?? "").trim();

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { cpf: { contains: q } },
            { email: { contains: q } },
            { advogado: { contains: q } },
            { idProcesso: { contains: q } },
            { status: { contains: q } },
            { tipo: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="container">
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-end">

        
        <Link className="btn btn-dark" href="/clients/new">
          Novo
        </Link>
      </div>

      {searchParams?.ok === "1" ? (
        <div className="alert text-dark" style={{ marginBottom: 10 }}>
          ✅ Cliente cadastrado com sucesso.
        </div>
      ) : null}

      {searchParams?.updated === "1" ? (
        <div className="alert text-dark" style={{ marginBottom: 10 }}>
          ✅ Cliente atualizado com sucesso.
        </div>
      ) : null}

    <form 
  className="d-flex align-items-center" 
  action="/clients" 
  method="get" 
  style={{ marginBottom: 10 }}
>
  <input
    className="form-control form-control-sm"
    name="q"
    placeholder="Buscar..."
    defaultValue={q}
    style={{ maxWidth: 300 }}
  />
  <button 
    className="btn btn-sm btn-outline-secondary ms-2" 
    type="submit"
  >
    <i className="bi bi-search"></i>
  </button>
</form>



      {/* margem 5px e scroll só quando ficar grande */}
      <div style={{ paddingLeft: 5, paddingRight: 5 }}>
        <div style={{ overflow: "auto", maxHeight: "70vh" }}>
         <table className="table table-hover table-sm align-middle" style={{ width: "100%", minWidth: 1200 }}>
  <thead className="table-light">
    <tr>
      <th>Cliente</th>
      <th>Advogado</th>
      <th>Prioridade</th>
      <th>Tipo</th>             
      <th>Status</th>
      <th>Atendimento</th>
      <th>Audiência</th>
      <th className="text-end">Ações</th>
    </tr>
  </thead>

  <tbody>
    {clients.map((c) => (
      <tr key={c.id}>
         <td className="fw-bold">{c.name}</td>
        <td className="text-muted small">{c.advogado ?? "—"}</td>
        <td>
          <span className="badge bg-secondary">{c.prioridade}</span>
        </td>
        <td className="text-muted small">{c.tipo ?? "—"}</td>
        <td className="text-muted small">{c.status ?? "—"}</td>
        <td className="text-muted small">{c.data ? new Date(c.data).toLocaleDateString("pt-BR") : "—"}</td>
        <td className="text-muted small">{c.dataAudiencia ? new Date(c.dataAudiencia).toLocaleString("pt-BR") : "—"}</td>

        <td className="text-end">
          <div className="btn-group" role="group">
            <Link className="btn btn-sm " href={`/clients/${c.id}`}>
              <i className="bi bi-eye"></i> Ver
            </Link>
            <Link className="btn btn-sm " href={`/clients/${c.id}/edit`}>
              <i className="bi bi-pencil"></i> Editar
            </Link>
            <a className="btn btn-sm " href={`/api/clients/${c.id}/pdf`} target="_blank" rel="noreferrer">
              <i className="bi bi-file-earmark-pdf"></i> PDF
            </a>
            <form
              action={async () => {
                "use server";
                await deleteClient(c.id);
              }}
            >
              <button className="btn btn-sm " type="submit">
                <i className="bi bi-trash"></i> Excluir
              </button>
            </form>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

        </div>
      </div>

      {clients.length === 0 && <div className="text-muted small">Nenhum registro encontrado.</div>}
    </div>
  );
}
