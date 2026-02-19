import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { saveSmtpConfigAction, testSmtpAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SmtpSettingsPage({
  searchParams,
}: {
  searchParams?: { msg?: string; type?: string };
}) {
  await requireRole(["ADMIN"]);

  const cfg = await prisma.smtpConfig.findUnique({ where: { id: "main" } });

  const msg = searchParams?.msg;
  const type = searchParams?.type === "success" ? "success" : "danger";

  return (
    <div className="container-fluid">
      {/* Alert */}
      {msg ? (
        <div className={`alert alert-${type} mb-3`} role="alert">
          {msg}
        </div>
      ) : null}

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">SMTP (Envio de senha)</h1>
          <div className="text-muted small">
            Configuração global para enviar o link de “definir senha”. O remetente é fixo do desenvolvedor (ENV).
          </div>
        </div>

        <Link className="btn btn-outline-secondary" href="/settings">
          Voltar
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form action={saveSmtpConfigAction}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Host</label>
                <input
                  className="form-control"
                  name="host"
                  defaultValue={cfg?.host ?? ""}
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Porta</label>
                <input
                  className="form-control"
                  name="port"
                  type="number"
                  defaultValue={cfg?.port ?? 587}
                  required
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label">Secure (TLS)</label>
                <select
                  className="form-select"
                  name="secure"
                  defaultValue={cfg?.secure ? "true" : "false"}
                >
                  <option value="false">Não</option>
                  <option value="true">Sim</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Usuário</label>
                <input
                  className="form-control"
                  name="username"
                  defaultValue={cfg?.username ?? ""}
                  placeholder="usuario@email.com"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Senha</label>
                <input
                  className="form-control"
                  name="password"
                  type="password"
                  placeholder="(deixe vazio para manter)"
                />
                <div className="form-text">A senha é salva criptografada no banco.</div>
              </div>

              <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
                <button className="btn btn-outline-secondary" formAction={testSmtpAction}>
                  Testar SMTP
                </button>
                <button className="btn btn-dark" type="submit">
                  Salvar
                </button>
              </div>
            </div>
          </form>

          <hr />

          <div className="text-muted small">
            Remetente fixo:{" "}
            <b>{process.env.SMTP_FROM_EMAIL ?? "SMTP_FROM_EMAIL (ENV) não definido"}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
