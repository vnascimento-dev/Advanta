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
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "#ffffff",
      }}
    >
      <div
        className="p-4 shadow"
        style={{
          width: 360,
          borderRadius: 20,
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div className="text-center mb-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={300}
            height={98}
            style={{ marginBottom: 12 }}
          />
          <h4 className="fw-bold mb-1">Advanta</h4>
          
        </div>

        {err && (
          <div className="alert alert-danger py-2 text-center">
            {err}
          </div>
        )}

        <form action={loginAction} className="d-flex flex-column gap-3">
          <input type="hidden" name="next" value={next} />

          <input
            className="form-control form-control-lg"
            name="email"
            type="email"
            placeholder="Usuário (email)"
            required
            style={{
              borderRadius: 12,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />

          <input
            className="form-control form-control-lg"
            name="password"
            type="password"
            placeholder="Senha"
            required
            style={{
              borderRadius: 12,
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />

          <button
            className="btn btn-dark btn-lg w-100"
            type="submit"
            style={{
              borderRadius: 12,
              fontWeight: 600,
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
