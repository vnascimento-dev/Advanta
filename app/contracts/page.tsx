import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SERVICE_TYPES = [
  { value: "CONSULTORIA", label: "Consultoria Jurídica" },
  { value: "PROCESSUAL", label: "Atuação Processual" },
  { value: "ADMINISTRATIVO", label: "Procedimento Administrativo" },
  { value: "TRABALHISTA", label: "Ação Trabalhista" },
  { value: "PREVIDENCIARIO", label: "Ação Previdenciária" },
];

export default async function ContractsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      cpf: true,
      email: true,
      whatsapp: true,
      idProcesso: true,
    },
    take: 500,
  });

  return (
    <div className="container-fluid">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Contratos</h1>
          <div className="text-muted small">
            Gere um contrato em PDF selecionando o cliente e o tipo de serviço.
          </div>
        </div>

        <Link className="btn btn-outline-secondary" href="/inicio">
          Voltar
        </Link>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card">
            <div className="card-body">
              <div className="fw-semibold mb-2">Gerar contrato (PDF)</div>
              <div className="text-muted small mb-3">
                O PDF abre em uma nova aba. Você pode salvar ou imprimir.
              </div>

              <form
                method="GET"
                action="/api/contracts/pdf"
                target="_blank"
                className="row g-3"
              >
                <div className="col-12">
                  <label className="form-label">Cliente</label>
                  <select className="form-select" name="clientId" required defaultValue="">
                    <option value="" disabled>
                      Selecione um cliente...
                    </option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.idProcesso ? ` • ${c.idProcesso}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Tipo de serviço</label>
                  <select className="form-select" name="serviceType" required defaultValue={SERVICE_TYPES[0].value}>
                    {SERVICE_TYPES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Valor (opcional)</label>
                  <input className="form-control" name="valor" placeholder="Ex: R$ 2.500,00" />
                </div>

                <div className="col-12">
                  <label className="form-label">Observações (opcional)</label>
                  <textarea
                    className="form-control"
                    name="observacoes"
                    rows={4}
                    placeholder="Cláusulas adicionais, forma de pagamento, etc."
                  />
                </div>

                <div className="col-12 d-flex gap-2 justify-content-end">
                  <button className="btn btn-dark" type="submit">
                    Gerar PDF
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <div className="fw-semibold mb-2">Clientes cadastrados</div>
              <div className="text-muted small mb-3">
                Total: <b>{clients.length}</b>
              </div>

              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th className="text-muted">Processo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(0, 12).map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="fw-semibold">{c.name}</div>
                          <div className="text-muted small">{c.email ?? "—"}</div>
                        </td>
                        <td className="text-muted">{c.idProcesso ?? "—"}</td>
                      </tr>
                    ))}
                    {clients.length > 12 ? (
                      <tr>
                        <td colSpan={2} className="text-muted small">
                          Mostrando 12 de {clients.length}. Use a lista de clientes para ver todos.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
