import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { toggleUserActive } from "@/app/users/actions";
import { sendSetPasswordLink } from "@/app/users/invite";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { msg?: string; type?: string };
}) {
  await requireRole(["ADMIN"]);

  const msg = searchParams?.msg;
  const type = searchParams?.type === "success" ? "success" : "danger";

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="container-fluid">
      {msg ? (
        <div className={`alert alert-${type} mb-3`} role="alert">
          {msg}
        </div>
      ) : null}

      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Usuários (Admin)</h1>
          <div className="text-muted small">
            Gerencie usuários, perfis e status. Somente{" "}
            <span className="badge text-bg-secondary">ADMIN</span> acessa esta tela.
          </div>
        </div>

        <Link className="btn btn-dark" href="/users/new">
          Novo usuário
        </Link>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-semibold">{u.name}</td>
                    <td className="text-muted small">{u.email}</td>

                    <td>
                      <span className="badge text-bg-secondary">{u.role}</span>
                    </td>

                    <td>
                      {u.isActive ? (
                        <span className="badge text-bg-success">Ativo</span>
                      ) : (
                        <span className="badge text-bg-danger">Inativo</span>
                      )}
                    </td>

                    <td className="text-end">
                      <div className="d-inline-flex flex-wrap gap-2 justify-content-end">
                        <Link
                          className="btn btn-outline-secondary btn-sm"
                          href={`/users/${u.id}/edit`}
                        >
                          Editar
                        </Link>

                        {/* Enviar/Reenviar link de senha (com feedback via querystring) */}
                        <form
                          action={async () => {
                            "use server";
                            const res = await sendSetPasswordLink(u.id);

                            const params = new URLSearchParams({
                              type: res.ok ? "success" : "danger",
                              msg: res.message,
                            });

                            redirect(`/users?${params.toString()}`);
                          }}
                        >
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            type="submit"
                          >
                            Enviar link de senha
                          </button>
                        </form>

                        {/* Ativar/Desativar */}
                        <form
                          action={async () => {
                            "use server";
                            await toggleUserActive(u.id, !u.isActive);
                            redirect("/users");
                          }}
                        >
                          <button
                            className={`btn btn-sm ${
                              u.isActive
                                ? "btn-outline-danger"
                                : "btn-outline-success"
                            }`}
                            type="submit"
                          >
                            {u.isActive ? "Desativar" : "Ativar"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rodapé / dica */}
      <div className="alert alert-secondary mt-3 mb-0">
        <div className="fw-semibold">Dica</div>
        <div className="small">
          O link de senha expira em <b>2 horas</b>. Você pode reenviar o link a qualquer momento.
          Se SMTP não estiver configurado, você verá um alerta aqui em cima.
        </div>
      </div>
    </div>
  );
}
