import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteHearing } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function HearingsPage() {
  const hearings = await prisma.hearing.findMany({
    orderBy: { scheduledAt: "asc" },
    take: 250,
    include: { process: { include: { client: true } } },
  });

  return (
    <div className="card">
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <h1>Audiências</h1>
        <Link className="btn btn-dark" href="/hearings/new">Nova</Link>
      </div>

      <table className="table table-sm">
        <thead>
          <tr>
            <th>Data</th>
            <th>Processo</th>
            <th>Cliente</th>
            <th>Local/Link</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hearings.map((h) => (
            <tr key={h.id}>
              <td style={{ fontWeight: 800 }}>{new Date(h.scheduledAt).toLocaleString("pt-BR")}</td>
              <td className="text-muted small">{h.process.cnjNumber}</td>
              <td className="text-muted small">{h.process.client.name}</td>
              <td className="text-muted small">
                <div>{h.location ?? "—"}</div>
                {h.link ? <div><a href={h.link} target="_blank">{h.link}</a></div> : null}
              </td>
              <td style={{ textAlign: "right" }}>
                <form action={async () => { "use server"; await deleteHearing(h.id); }}>
                  <button className="btn btn-outline-danger" type="submit">Excluir</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hearings.length === 0 && <div className="text-muted small">Nenhuma audiência cadastrada.</div>}
    </div>
  );
}
