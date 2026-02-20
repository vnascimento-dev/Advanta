import Link from "next/link";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="container">
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <h1>Configurações</h1>
        <Link className="btn btn-outline-secondary" href="/settings">Voltar</Link>
      </div>

      <div style={{ marginTop: 10, padding: 10 }} className="card">
        <div className="text-muted small">Logado como :</div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{session?.name}</div>
        <div className="text-muted small">{session?.email} • <span className="badge text-bg-light">{session?.role}</span></div>
      </div>

      <div style={{ marginTop: 12 }} className="d-flex flex-wrap gap-2 align-items-center">
        {session?.role === "ADMIN" ? <Link className="btn btn-outline-secondary" href="/pje/config">Integração DataJud</Link> : null}
        {session?.role === "ADMIN" ? <Link className="btn btn-outline-secondary" href="/settings/smtp">SMTP Config</Link> : null}
      </div>

      <div className="text-muted small" style={{ marginTop: 12 }}>
        (MVP) Próximos ajustes: mudar senha, logo do escritório, parâmetros de integração com PJe, etc.
      </div>
    </div>
  );
}
