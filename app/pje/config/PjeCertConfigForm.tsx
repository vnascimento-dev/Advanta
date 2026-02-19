"use client";

import { useMemo, useState } from "react";
import { alert, toast } from "@/lib/alerts";

export default function PjeCertConfigForm({
  currentFilename,
  currentDatajudApiKey,
  currentDatajudDefaultAlias,
}: {
  currentFilename?: string | null;
  currentDatajudApiKey?: string | null;
  currentDatajudDefaultAlias?: string | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [datajudKey, setDatajudKey] = useState(currentDatajudApiKey || "");
  const [datajudAlias, setDatajudAlias] = useState(currentDatajudDefaultAlias || "api_publica_tjmt");
  const [showDatajudKey, setShowDatajudKey] = useState(false);

  const canSubmit = useMemo(() => !!file && password.length > 0 && !loading, [file, password, loading]);

  async function upload() {
    if (!file || !password) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("cert", file);
      fd.append("password", password);
      const res = await fetch("/api/pje/config/cert", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Falha ao salvar");
      toast("Certificado salvo", "success");
    } catch (e: any) {
      await alert("Erro", e?.message || "Falha ao salvar", "error");
    } finally {
      setLoading(false);
    }
  }

  async function testCert() {
    setLoading(true);
    try {
      const res = await fetch("/api/pje/config/test", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao testar");

      if (json?.ok) {
        await alert(
          "OK — Certificado válido",
          `Arquivo: ${json.filename || "(sem nome)"}\nVálido até: ${json.notAfter ? new Date(json.notAfter).toLocaleString("pt-BR") : "—"}`,
          "success"
        );
      } else {
        await alert(
          "Atenção",
          `Arquivo: ${json.filename || "(sem nome)"}\nTem chave privada: ${json.hasKey ? "Sim" : "Não"}\nVálido até: ${json.notAfter ? new Date(json.notAfter).toLocaleString("pt-BR") : "—"}`,
          "warning"
        );
      }
    } catch (e: any) {
      await alert("Erro", e?.message || "Falha ao testar", "error");
    } finally {
      setLoading(false);
    }
  }

  async function saveDatajud() {
    setLoading(true);
    try {
      const res = await fetch("/api/pje/config/datajud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: datajudKey, defaultAlias: datajudAlias }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Falha ao salvar");
      toast("Configuração do Datajud salva", "success");
    } catch (e: any) {
      await alert("Erro", e?.message || "Falha ao salvar", "error");
    } finally {
      setLoading(false);
    }
  }

  async function testDatajud() {
    setLoading(true);
    try {
      const res = await fetch("/api/pje/config/datajud/test", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Falha ao testar");
      await alert(
        "OK — Datajud autenticado",
        `Índice: ${json.alias}\nResposta: OK (hits: ${json.hits ?? 0})`,
        "success"
      );
    } catch (e: any) {
      await alert("Erro", e?.message || "Falha ao testar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Datajud */}
      <div className="card p-3">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div>
            <div className="fw-bold">Datajud (API Pública)</div>
            <div className="text-muted small">Configure a API Key e o tribunal padrão (índice).</div>
          </div>
          <button className="btn btn-outline-secondary" type="button" onClick={testDatajud} disabled={loading}>
            Testar Datajud
          </button>
        </div>

        <hr />

        <div className="row g-2">
          <div className="col-12 col-lg-7">
            <label className="form-label">API Key</label>
            <div className="input-group">
              <input
                className="form-control"
                type={showDatajudKey ? "text" : "password"}
                value={datajudKey}
                onChange={(e) => setDatajudKey(e.target.value)}
                placeholder="Cole aqui a API Key do Datajud"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowDatajudKey((s) => !s)}
                aria-label="Mostrar/ocultar"
              >
                {showDatajudKey ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <div className="form-text">A chave fica salva no banco. Recomendo restringir acesso à tela (ADMIN).</div>
          </div>

          <div className="col-12 col-lg-5">
            <label className="form-label">Tribunal padrão (Datajud)</label>
            <select className="form-select" value={datajudAlias} onChange={(e) => setDatajudAlias(e.target.value)}>
              <option value="api_publica_tjmt">TJMT</option>
              <option value="api_publica_trf1">TRF1</option>
            </select>
            <div className="form-text">Se o cliente não tiver tribunal definido, usa este padrão.</div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ marginTop: 12 }}>
          <button className="btn btn-dark" type="button" onClick={saveDatajud} disabled={loading}>
            Salvar Datajud
          </button>
        </div>
      </div>

      {/* Certificado (mantido) */}
      <div className="card p-3">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div>
            <div className="fw-bold">Certificado (A1)</div>
            <div className="text-muted small">
              Atual: <b>{currentFilename || "(não configurado)"}</b>
            </div>
          </div>
          <button className="btn btn-outline-secondary" type="button" onClick={testCert} disabled={loading}>
            Testar certificado
          </button>
        </div>

        <hr />

        <div className="row g-2">
          <div className="col-12 col-lg-6">
            <label className="form-label">Arquivo (.pfx / .p12)</label>
            <input
              className="form-control"
              type="file"
              accept=".pfx,.p12"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="col-12 col-lg-6">
            <label className="form-label">Senha</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha do certificado"
            />
            <div className="text-muted small" style={{ marginTop: 6 }}>
              A senha será armazenada criptografada no banco (requer PJE_MASTER_KEY no servidor).
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ marginTop: 12 }}>
          <button className="btn btn-dark" type="button" onClick={upload} disabled={!canSubmit}>
            Salvar certificado
          </button>
        </div>
      </div>
    </div>
  );
}
