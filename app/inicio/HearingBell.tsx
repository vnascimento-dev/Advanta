"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type HearingItem = {
  id: string;
  scheduledAt: string; // ISO
  location: string | null;
  process: { cnjNumber: string; client: { name: string } };
};

function daysUntil(dateIso: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(dateIso);
  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
}


function badgeClassByDays(d: number) {
  // <=1 vermelho, 2 laranja, 3 amarelo, >=4 verde
  if (d <= 1) return "text-bg-danger";
  if (d === 2) return "text-bg-warning"; // vai ficar amarelo, mas a gente ajusta texto
  if (d === 3) return "text-bg-warning";
  return "text-bg-success";
}

function badgeTextByDays(d: number) {
  if (d <= 0) return "Hoje";
  if (d === 1) return "1 dia";
  return `${d} dias`;
}

export default function HearingBell({ hearings }: { hearings: HearingItem[] }) {
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement | null>(null);

  const upcoming = useMemo(() => {
    return hearings
      .map((h) => ({ ...h, d: daysUntil(h.scheduledAt) }))
      .filter((h) => h.d <= 7) // já vem assim do server, mas garante
      .sort((a, b) => a.d - b.d);
  }, [hearings]);

  const urgentCount = useMemo(() => upcoming.filter((h) => h.d <= 5).length, [upcoming]);

  useEffect(() => {
    // Balançar o sino quando houver audiência "chegando" (<=5 dias)
    if (!bellRef.current) return;
    if (urgentCount <= 0) return;

    const el = bellRef.current;
    const anim = el.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-12deg)" },
        { transform: "rotate(12deg)" },
        { transform: "rotate(-10deg)" },
        { transform: "rotate(10deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 650, iterations: 3 }
    );

    return () => anim.cancel();
  }, [urgentCount]);

  return (
    <div className="position-relative">
      <button
        ref={bellRef}
        type="button"
        className="btn btn-outline position-relative"
        onClick={() => setOpen((v) => !v)}
        aria-label="Alertas de audiência"
      >
        <i className="bi bi-bell" />
        {urgentCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">
            {urgentCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card position-absolute end-0 mt-2"
          style={{ width: 420, zIndex: 50 }}
        >
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="fw-semibold">Audiências próximas</div>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            {upcoming.length === 0 ? (
              <div className="text-muted small">Nenhuma audiência nos próximos dias.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Em</th>
                      <th>Cliente</th>
                      <th>Processo</th>
                      <th>Local</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcoming.map((h) => (
                      <tr key={h.id}>
                        <td>
                          <span className={`badge ${badgeClassByDays(h.d)} ${h.d === 2 ? "text-dark" : ""}`}>
                            {badgeTextByDays(h.d)}
                          </span>
                        </td>
                        <td>{h.process.client.name}</td>
                        <td className="text-muted">{h.process.cnjNumber}</td>
                        <td className="text-muted">{h.location ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-muted small mt-2">
              Clique no sino para abrir/fechar a lista.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
