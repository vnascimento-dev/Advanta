
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateClient } from "@/app/actions";
import PasswordField from "@/app/components/PasswordField";


export const dynamic = "force-dynamic";

function toDateInput(dt?: Date | null) {
  if (!dt) return "";
  return new Date(dt).toISOString().slice(0, 10);
}

function toDateTimeLocalInput(dt?: Date | null) {
  if (!dt) return "";
  // datetime-local espera "YYYY-MM-DDTHH:mm" (sem Z). Ajuste simples:
  const d = new Date(dt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const c = await prisma.client.findUnique({ where: { id: params.id } });

  if (!c) {
    return (
      <div className="container-fluid">
        <div className="card">
          <div className="card-body">
            <h1 className="h5 mb-3">Cliente não encontrado</h1>
            <Link className="btn btn-outline-secondary" href="/clients">Voltar</Link>
          </div>
        </div>
      </div>
    );
  }

  async function action(formData: FormData) {
    "use server";
    await updateClient(params.id, formData);
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Editar cliente</h1>
          <div className="text-muted small">
            Atualize os dados do cliente e informações do processo/audiência.
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" href={`/clients`}>
            Voltar
          </Link>
        </div>
      </div>

      <form action={action}>
        <div className="row g-3">
          {/* Card 1: Dados principais */}
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="fw-semibold">Dados do cliente</div>
                  <span className="badge text-bg-secondary">ID: {c.id}</span>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-3">
                    <label className="form-label">Data</label>
                    <input className="form-control" name="data" type="date" defaultValue={toDateInput(c.data)} />
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Prioridade</label>
                    <select className="form-select" name="prioridade" defaultValue={c.prioridade}>
                      <option value="BAIXA">BAIXA</option>
                      <option value="MEDIA">MEDIA</option>
                      <option value="ALTA">ALTA</option>
                      <option value="URGENTE">URGENTE</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Advogado</label>
                    <input className="form-control" name="advogado" defaultValue={c.advogado ?? ""} />
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Tipo</label>
                    <input className="form-control" name="tipo" defaultValue={c.tipo ?? ""} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Cliente *</label>
                    <input className="form-control" name="name" required defaultValue={c.name} />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">CPF</label>
                    <input className="form-control" name="cpf" defaultValue={c.cpf ?? ""} />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Email</label>
                    <input className="form-control" name="email" type="email" defaultValue={c.email ?? ""} />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Whatsapp</label>
                    <input className="form-control" name="whatsapp" defaultValue={c.whatsapp ?? ""} />
                  </div>

                  <div className="col-12 col-md-4">
  <label className="form-label">Senha Gov.br</label>
  <PasswordField
    name="senhaGovBr"
    defaultValue={c.senhaGovBr ?? ""}
  />
  <div className="form-text">
    Clique no ícone para visualizar ou ocultar a senha.
  </div>
</div>


                  <div className="col-12 col-md-4">
  <label className="form-label">Status</label>
  <select
    className="form-select"
    name="status"
    defaultValue={c.status ?? "Em Andamento"}
  >
    <option value="Em Andamento">Em Andamento</option>
    <option value="Realizada">Realizada</option>
    <option value="Pausada">Pausada</option>
  </select>
</div>


                  <div className="col-12 col-md-4">
                    <label className="form-label">ID Processo</label>
                    <input className="form-control" name="idProcesso" defaultValue={c.idProcesso ?? ""} />
                    <div className="form-text">Usado para consulta no Datajud (número CNJ). Pode vir com ou sem pontuação.</div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Tribunal (Datajud)</label>
                    <select className="form-select" name="datajudAlias" defaultValue={c.datajudAlias ?? "api_publica_tjmt"}>
                      <option value="api_publica_tjmt">TJMT</option>
                      <option value="api_publica_trf1">TRF1</option>
                    </select>
                    <div className="form-text">Define qual índice do Datajud será consultado para este processo.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Audiência + Links */}
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <div className="fw-semibold mb-3">Audiência</div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Data da Audiência</label>
                    <input
                      className="form-control"
                      name="dataAudiencia"
                      type="datetime-local"
                      defaultValue={toDateTimeLocalInput(c.dataAudiencia)}
                    />
                    <div className="form-text">Isso alimenta o painel de alertas do sistema.</div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Link detalhes</label>
                    <input className="form-control" name="linkDetalhes" defaultValue={c.linkDetalhes ?? ""} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Atividade */}
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <div className="fw-semibold mb-3">Atividade</div>
                <label className="form-label">Descrição / Observações</label>
                <textarea className="form-control" name="atividade" rows={10} defaultValue={c.atividade ?? ""} />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="col-12">
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <Link className="btn btn-outline-secondary" href={`/clients`}>
                Cancelar
              </Link>
              <button className="btn btn-dark" type="submit">
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
