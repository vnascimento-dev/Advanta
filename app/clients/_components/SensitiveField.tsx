"use client";

import { useState } from "react";

export default function SensitiveField({
  label,
  value,
  isPassword,
}: {
  label: string;
  value: string;
  isPassword?: boolean;
}) {
  const [show, setShow] = useState(false);

  const masked = value ? "•".repeat(Math.min(value.length, 10)) : "—";
  const display = show ? value || "—" : masked;

  return (
    <div style={{ marginTop: 8 }}>
      <div className="text-muted small">{label}</div>
      <div className="d-flex flex-wrap gap-2 align-items-center" style={{ justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800 }}>{display}</div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setShow((s) => !s)}
          style={{ padding: "6px 10px" }}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
      {isPassword ? <div className="text-muted small">Somente aqui aparece com o “olho”.</div> : null}
    </div>
  );
}
