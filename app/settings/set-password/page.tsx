import { setPasswordAction } from "./actions";

export const dynamic = "force-dynamic";

export default function SetPasswordPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = searchParams?.token ?? "";

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card mt-4">
            <div className="card-body">
              <h1 className="h5 mb-2">Definir senha</h1>
              <div className="text-muted small mb-3">
                Crie sua senha para acessar o Advanta CRM.
              </div>

              <form action={setPasswordAction} className="d-grid gap-2">
                <input type="hidden" name="token" value={token} />

                <label className="form-label mb-0">Nova senha</label>
                <input className="form-control" name="password" type="password" minLength={6} required />

                <label className="form-label mb-0">Confirmar senha</label>
                <input className="form-control" name="password2" type="password" minLength={6} required />

                <button className="btn btn-dark mt-2" type="submit">Salvar senha</button>

                <div className="text-muted small">
                  Mínimo 6 caracteres. O link expira em 2 horas.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
