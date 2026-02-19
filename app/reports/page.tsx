import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="card">
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <h1>Relatórios</h1>
        <Link className="btn btn-outline-secondary" href="/inicio">Voltar</Link>
      </div>

      <div className="text-muted small" style={{ marginTop: 8 }}>
        Área de relatórios (MVP). 
        <br />
        Em breve podemos adicionar:
        <ul style={{ marginTop: 8 }}>
          <li>Produtividade por advogado</li>
          <li>Prazos por período</li>
          <li>Status de processos</li>
          <li>Relatório financeiro</li>
        </ul>
      </div>
    </div>
  );
}
