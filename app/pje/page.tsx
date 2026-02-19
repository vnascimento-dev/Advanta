import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PJePage() {
  const session = await getSession();
  const url = process.env.PJE_URL || "https://pje.tjmt.jus.br/pje/login.seam";

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between", padding: 14 }}>
        <div>
          <h1 style={{ margin: 0 }}>PJe</h1>
          <div className="text-muted small">Abrindo dentro do CRM (iframe). Se o tribunal bloquear, use “Abrir em nova aba”.</div>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <a className="btn btn-outline-secondary" href={url} target="_blank" rel="noreferrer">Abrir em nova aba</a>
         
          <Link className="btn btn-outline-secondary" href="/inicio">Voltar</Link>
        </div>
      </div>

      <div style={{ height: "78vh", borderTop: "1px solid #eee" }}>
        <iframe
          src={url}
          title="PJe"
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      </div>
    </div>
  );
}
