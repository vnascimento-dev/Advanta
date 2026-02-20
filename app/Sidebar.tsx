"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar({ role }: { role: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItem = (href: string, icon: string, label: string) => {
    const active = pathname.startsWith(href);

    return (
      <Link
  href={href}
  className="nav-link d-flex align-items-center gap-2 rounded"
  style={{
    transition: "all 0.2s ease",
    ...(active
      ? {
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          fontWeight: 600,
        }
      : {
          color: "rgba(255,255,255,0.75)",
        }),
  }}
>
        <i className={`bi ${icon}`} />
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className="d-flex flex-column p-3 text-white border-end"
      style={{
        width: collapsed ? 80 : 260,
        minHeight: "100vh",
        transition: "all 0.25s ease",
        background: "#000000",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        {!collapsed && <span className="fw-bold fs-5">Advanta</span>}

        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`bi ${collapsed ? "bi-list" : "bi-chevron-left"}`} />
        </button>
      </div>

      <nav className="nav nav-pills flex-column gap-2">
        {navItem("/inicio", "bi-house", "Início")}
        {navItem("/clients", "bi-people", "Clientes")}
        {navItem("/contracts", "bi-file-earmark-text", "Contratos")}
        {navItem("/pje", "bi-shield-check", "PJe")}
        {navItem("/settings", "bi-gear", "Configurações")}
        {navItem("/reports", "bi-bar-chart", "Relatórios")}
        {role === "ADMIN" &&
          navItem("/users", "bi-person-gear", "Usuários")}
      </nav>

      <div className="mt-auto pt-3">
        <form action="/api/auth/logout" method="post">
          <button className="btn btn-outline-light w-100">
            {!collapsed ? "Sair" : <i className="bi bi-box-arrow-right" />}
          </button>
        </form>
      </div>
    </aside>
  );
}
