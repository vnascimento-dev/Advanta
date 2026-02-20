import Link from "next/link";
import { createClient } from "@/app/actions";
import PasswordField from "@/app/components/PasswordField";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Novo cliente</h1>
          <div className="text-muted small">Cadastre o cliente e, se houver, dados de processo e audiência.</div>
        </div>
        <Link className="btn btn-outline-secondary" href="/clients">
          Voltar
        </Link>
      </div>

      <form action={createClient}>
        <div className="row g-3">
          {/* Card 1: Dados do cliente */}
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                

                <div className="row g-3">
                  <div className="col-12 col-md-3">
                    <label className="form-label">Data de Atendimento</label>
                    <input className="form-control" name="data" type="date" />
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Prioridade</label>
                    <select className="form-select" name="prioridade" defaultValue="MEDIA">
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Advogado Responsável</label>
                    <input className="form-control" name="advogado" placeholder="Ex: João Silva" />
                  </div>

                  <div className="col-12 col-md-3">
                    <label className="form-label">Tipo</label>
                    <input className="form-control" name="tipo" placeholder="Ex: Trabalhista / Cível / Previdenciário" />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Cliente *</label>
                    <input className="form-control" name="name" required placeholder="Nome do cliente" />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">CPF</label>
                    <input className="form-control" name="cpf" placeholder="000.000.000-00" />
                    <div className="form-text">Na listagem, aparece mascarado.</div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Email</label>
                    <input className="form-control" name="email" type="email" placeholder="cliente@email.com" />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Telefone / WhatsApp</label>
                    <input className="form-control" name="whatsapp" placeholder="(65) 99999-9999" />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Senha Gov.br</label>
                    <PasswordField name="senhaGovBr" defaultValue="" />
                    <div className="form-text">Na listagem fica mascarado.</div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Status</label>
                    <select className="form-select" name="status" defaultValue="Em Andamento">
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Realizada">Realizada</option>
                      <option value="Pausada">Pausada</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">ID Processo</label>
                    <input className="form-control" name="idProcesso" placeholder="Ex: 0000000-00.0000.0.00.0000" />
                    <div className="form-text">Usado para consulta no Datajud (número CNJ). Pode vir com ou sem pontuação.</div>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Tribunal (Datajud)</label>
                    <select className="form-select" name="datajudAlias" defaultValue="api_publica_tjmt">
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
                    <input className="form-control" name="dataAudiencia" type="datetime-local" />
                    <div className="form-text">Isso alimenta os alertas do painel.</div>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Link detalhes</label>
                    <input className="form-control" name="linkDetalhes" placeholder="https://..." />
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
                <textarea
                  className="form-control"
                  name="atividade"
                  rows={10}
                  placeholder="Descreva a atividade / observações / andamento..."
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="col-12">
            <div className="d-flex flex-wrap gap-2 justify-content-end">
              <Link className="btn btn-outline-secondary" href="/clients">
                Cancelar
              </Link>
              <button className="btn btn-dark" type="submit">
                Salvar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
