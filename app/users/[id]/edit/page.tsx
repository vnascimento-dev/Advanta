import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { updateUserAction } from "@/app/users/actions";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  await requireRole(["ADMIN"]);

  const u = await prisma.user.findUnique({ where: { id: params.id } });
  if (!u) {
    return (
      <div className="container-fluid">
        <div className="card">
          <div className="card-body">
            <h1 className="h5 mb-3">Usuário não encontrado</h1>
            <Link className="btn btn-outline-secondary" href="/users">Voltar</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Editar usuário</h1>
          <div className="text-muted small">Atualize dados, permissões e status de acesso.</div>
        </div>

        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" href="/users">Voltar</Link>
        </div>
      </div>

      <div className="row g-3">
        {/* Card principal */}
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="fw-semibold">Dados do usuário</div>
                <span className="badge text-bg-secondary">ID: {u.id}</span>
              </div>

              <form action={updateUserAction}>
                <input type="hidden" name="id" value={u.id} />

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Nome</label>
                    <input className="form-control" name="name" defaultValue={u.name} required />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input className="form-control" name="email" type="email" defaultValue={u.email} required />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Perfil (Role)</label>
                    <select className="form-select" name="role" defaultValue={u.role}>
                      <option value="ADMIN">ADMIN</option>
                      <option value="ADVOGADO">ADVOGADO</option>
                      <option value="ASSISTENTE">ASSISTENTE</option>
                      <option value="LEITURA">LEITURA</option>
                    </select>
                    <div className="form-text">Define permissões no sistema.</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" name="isActive" defaultValue={u.isActive ? "true" : "false"}>
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                    <div className="form-text">Usuário inativo não consegue logar.</div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Nova senha (opcional)</label>
                    <input
                      className="form-control"
                      name="password"
                      type="password"
                      placeholder="mínimo 6 caracteres (deixe vazio para não alterar)"
                    />
                    <div className="form-text">
                      Para resetar a senha, preencha aqui e salve.
                    </div>
                  </div>

                  <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
                    <Link className="btn btn-outline-secondary" href="/users">Cancelar</Link>
                    <button className="btn btn-dark" type="submit">Salvar alterações</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Card lateral */}
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="fw-semibold mb-2">Ações rápidas</div>

              <div className="text-muted small mb-3">
                Para o fluxo de “definir senha por email”, habilite SMTP nas Configurações.
              </div>

              <div className="d-grid gap-2">
                <Link className="btn btn-outline-secondary" href="/settings">
                  Ir para Configurações
                </Link>
                <Link className="btn btn-outline-secondary" href="/users">
                  Voltar para Usuários
                </Link>
              </div>
            </div>
          </div>

          <div className="alert alert-warning mt-3 mb-0">
            <div className="fw-semibold">Dica</div>
            <div className="small">
              Use “Inativo” para bloquear acesso sem apagar o usuário.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
