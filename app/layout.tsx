import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import BootstrapClient from "./BootstrapClient";
import Sidebar from "./Sidebar";

import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Advanta - Vantagem no Jurídico",
  description: "Controle de clientes, processos, prazos e audiências (RBAC)",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="pt-BR" data-bs-theme="white">
      <body className=" text-white">
        <BootstrapClient />

        {!session ? (
          <main className="container py-4">{children}</main>
        ) : (
          <div className="d-flex">
            <Sidebar role={session.role} />
            <div className="flex-grow-1 p-3">
              {children}
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
