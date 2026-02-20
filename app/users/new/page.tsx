import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createUserAction } from "@/app/users/actions";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requireRole(["ADMIN"]);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Novo usuário</h1>
          <div className="text-muted small">
            Ao criar, o sistema envia automaticamente um link por email para o usuário definir a senha (expira em 2h).
          </div>
        </div>

        <Link className="btn btn-outline-secondary" href="/users">
          Voltar
        </Link>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="fw-semibold mb-3">Dados do usuário</div>

              <form action={createUserAction}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Nome *</label>
                    <input className="form-control" name="name" required placeholder="Nome completo" />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Email *</label>
                    <input className="form-control" name="email" type="email" required placeholder="email@dominio.com" />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Role *</label>
                    <select className="form-select" name="role" defaultValue="ADVOGADO">
                      <option value="ADMIN">Administrador</option>
                      <option value="ADVOGADO">Advogado</option>
                      <option value="ASSISTENTE">Assistente</option>
                      <option value="LEITURA">Leitura</option>
                      <option value="DESENVOLVEDOR">Desenvolvedor</option>

                    </select>
                    <div className="form-text">Define permissões no sistema.</div>
                  </div>

                 <div>
  <label className="label">Status</label>
  <select className="form-select" name="isActive" defaultValue="true">
    <option value="true">Ativo</option>
    <option value="false">Inativo</option>
  </select>
</div>


                  <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
                    <Link className="btn btn-outline-secondary" href="/users">
                      Cancelar
                    </Link>
                    <button className="btn btn-dark" type="submit">
                      Criar e enviar link
                    </button>
                  </div>
                </div>
              </form>

              <div className="alert alert-secondary mt-3 mb-0">
                <div className="fw-semibold">Como funciona</div>
                <div className="small">
                  O usuário receberá um email com um link para definir a senha. O link expira em <b>2 horas</b>.
                  Se precisar, você pode reenviar o link na listagem de usuários.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card lateral */}
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="fw-semibold mb-2">Pré-requisito</div>
              <div className="text-muted small mb-3">
                Configure o SMTP global para envio de emails.
              </div>

              <div className="d-grid gap-2">
                <Link className="btn btn-outline-secondary" href="/settings/smtp">
                  Configurar SMTP
                </Link>
                <Link className="btn btn-outline-secondary" href="/users">
                  Voltar para Usuários
                </Link>
              </div>
            </div>
          </div>

          <div className="alert alert-warning mt-3 mb-0">
            <div className="fw-semibold">Remetente fixo</div>
            <div className="small">
              O email remetente é o do desenvolvedor via <code>.env</code> (SMTP_FROM_EMAIL).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
