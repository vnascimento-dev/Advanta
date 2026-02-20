import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { loginAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string; e?: string };
}) {
  const session = await getSession();
  if (session) redirect("/inicio");

  const next = searchParams?.next ?? "/inicio";
  const err = searchParams?.e;

  return (
    <div
      className="max-vh-100 d-flex align-items-center justify-content-center p-3"
      
    >
      <div className="container" style={{ maxWidth: 960 }}>
        <div className="row justify-content-center align-items-stretch g-3">
          {/* Painel esquerdo (brand) */}
          <div className="col-12 col-lg-6">
            <div
              className="h-100 p-4 p-md-5 border rounded-4"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                borderColor: "rgba(0,0,0,0.08)",
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-4">
                

                <div>
                  <div className="fw-bold" style={{ fontSize: 20 }}>

                  </div>
                  <div className="text-muted small"></div>
                </div>
              </div>

              <div className="mb-3">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={320}
                  height={105}
                  priority
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>

              <div className="text-muted">
                <div className="fw-semibold text-dark mb-2">Acesse sua conta</div>
                <div className="small">
                  Controle de clientes, processos, prazos, audiências e integrações (DataJud) em um painel simples e rápido.
                </div>
              </div>

              <hr className="my-4" />

              <div className="row g-2 text-muted small">
                <div className="col-12 col-sm-6">
                  <div className="d-flex gap-2 align-items-start">
                    <span className="badge text-bg-light border">🔒</span>
                    <div>
                      <div className="fw-semibold text-dark">Acesso seguro</div>
                      <div>RBAC por perfil </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="d-flex gap-2 align-items-start">
                    <span className="badge text-bg-light border">⚡</span>
                    <div>
                      <div className="fw-semibold text-dark">Rápido e direto</div>
                      <div>Interface minimalista, focada no essencial</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Painel direito (form) */}
          <div className="col-12 col-lg-6">
            <div
              className="h-100 p-4 p-md-5 shadow-sm border rounded-4"
              style={{
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                borderColor: "rgba(0,0,0,0.08)",
              }}
            >
              <div className="mb-4">
                <div className="fw-bold" style={{ fontSize: 22 }}>
                  Entrar
                </div>
                <div className="text-muted small">
                  Use seu email e senha para acessar o painel.
                </div>
              </div>

              {err ? (
                <div className="alert alert-danger py-2" role="alert">
                  {err}
                </div>
              ) : null}

              <form action={loginAction} className="d-flex flex-column gap-3">
                <input type="hidden" name="next" value={next} />

                <div>
                  <label className="form-label small text-muted mb-1">Email</label>
                  <input
                    className="form-control form-control-lg"
                    name="email"
                    type="email"
                    placeholder="seuemail@dominio.com"
                    required
                    autoComplete="email"
                    style={{ borderRadius: 14 }}
                  />
                </div>

                <div>
                  <label className="form-label small text-muted mb-1">Senha</label>
                  <input
                    className="form-control form-control-lg"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ borderRadius: 14 }}
                  />
                </div>

                <button
                  className="btn btn-dark btn-lg w-100"
                  type="submit"
                  style={{ borderRadius: 14, fontWeight: 700 }}
                >
                  Acessar painel
                </button>

                <div className="text-muted small mt-1">
                  Problemas para acessar? Fale com o administrador do sistema.
                </div>
              </form>

              <hr className="my-4" />

              <div className="d-flex justify-content-between align-items-center text-muted small">
                <span>© {new Date().getFullYear()} Advanta</span>
                <span className="badge text-bg-light border">CRM Jurídico</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}