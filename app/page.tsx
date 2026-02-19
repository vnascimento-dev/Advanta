import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { loginAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams?: { next?: string; e?: string } }) {
  const session = await getSession();
  if (session) redirect("/inicio");

  const next = searchParams?.next ?? "/inicio";
  const err = searchParams?.e;

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", textAlign: "center", color: "#fffefe" }}>
      <Image src="/logo.png" alt="Logo" width={80} height={80} style={{ marginBottom: 24 }} />
      <h1 style={{ marginTop: 0, fontWeight: "bold" }}></h1>
      <p style={{ marginBottom: 20, color: "#555" }}>Entre com usuário e senha</p>

      {err ? <div style={{ marginBottom: 16, color: "red" }}>Erro: {err}</div> : null}

      <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="hidden" name="next" value={next} />

        <input
          className="form-control"
          name="email"
          type="email"
          placeholder="Usuário (email)"
          required
          style={{ padding: 10, border: "1px solid #000", borderRadius: 4 }}
        />

        <input
          className="form-control"
          name="password"
          type="password"
          placeholder="Senha"
          required
          style={{ padding: 10, border: "1px solid #000", borderRadius: 4 }}
        />

        <button
          className="btn btn-outline-secondary"
          type="submit"
          style={{
            padding: 12,
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Entrar
        </button>

        
      </form>
    </div>
  );
}
