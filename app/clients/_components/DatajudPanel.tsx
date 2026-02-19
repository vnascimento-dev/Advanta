"use client";

import { useMemo, useState } from "react";
import { alert, toast } from "@/lib/alerts";

type Movement = {
  codigo: number;
  nome: string;
  dataHora: string; // ISO
  orgaoNome?: string | null;
};

export default function DatajudPanel({
  clientId,
  hasProcessNumber,
  initialMovements,
}: {
  clientId: string;
  hasProcessNumber: boolean;
  initialMovements?: Movement[];
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Movement[]>(initialMovements || []);
  const [meta, setMeta] = useState<{ tribunal?: string; numeroProcesso?: string; nivelSigilo?: number } | null>(null);

  const disabledReason = useMemo(() => {
    if (!hasProcessNumber) return "Informe o ID Processo (CNJ) para consultar.";
    return null;
  }, [hasProcessNumber]);

  async function sync() {
    if (disabledReason) {
      await alert("Atenção", disabledReason, "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/datajud/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao consultar Datajud");

      setItems(json?.movements || []);
      setMeta(json?.meta || null);
      toast("Datajud sincronizado", "success");
    } catch (e: any) {
      await alert("Erro", e?.message || "Falha ao consultar Datajud", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <div className="fw-semibold">Datajud • Andamentos</div>
            <div className="text-muted small">
              Consulta pública por número do processo (CNJ) e armazena movimentos.
            </div>
          </div>
          <button className="btn btn-outline-secondary" type="button" onClick={sync} disabled={loading}>
            {loading ? "Consultando…" : "Sincronizar"}
          </button>
        </div>

        {meta ? (
          <div className="text-muted small mt-2">
            <span className="me-2">Tribunal: <b>{meta.tribunal || "—"}</b></span>
            <span className="me-2">CNJ: <b>{meta.numeroProcesso || "—"}</b></span>
            <span>Nível de sigilo: <b>{typeof meta.nivelSigilo === "number" ? meta.nivelSigilo : "—"}</b></span>
          </div>
        ) : null}

        <hr />

        {items.length === 0 ? (
          <div className="text-muted small">Nenhum andamento carregado ainda.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th style={{ width: 170 }}>Data</th>
                  <th>Movimento</th>
                  <th style={{ width: 110 }}>Código</th>
                  <th>Órgão</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={`${m.codigo}-${m.dataHora}`}>
                    <td>{new Date(m.dataHora).toLocaleString("pt-BR")}</td>
                    <td>{m.nome}</td>
                    <td className="text-muted">{m.codigo}</td>
                    <td className="text-muted">{m.orgaoNome ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
