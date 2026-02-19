"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, getSession } from "@/lib/auth";
import { encryptSecret } from "@/lib/secret";
import { getFrom, getSmtpTransport } from "@/lib/mailer";
import { redirect } from "next/navigation";

function back(type: "success" | "danger", msg: string) {
  const params = new URLSearchParams({ type, msg });
  return `/settings/smtp?${params.toString()}`;
}

export async function saveSmtpConfigAction(formData: FormData) {
  await requireRole(["ADMIN"]);
  const session = await getSession();

  const host = String(formData.get("host") ?? "").trim();
  const port = Number(String(formData.get("port") ?? "").trim());
  const secure = String(formData.get("secure") ?? "false") === "true";
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!host) redirect(back("danger", "Preencha o Host do SMTP."));
  if (!port || Number.isNaN(port) || port <= 0) redirect(back("danger", "Preencha uma Porta válida."));
  if (!username) redirect(back("danger", "Preencha o Usuário do SMTP."));

  const data: any = {
    host,
    port,
    secure,
    username,
    updatedById: session?.userId ?? null,
  };

  if (password) data.passwordEnc = encryptSecret(password);

  await prisma.smtpConfig.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  });

  redirect(back("success", "SMTP salvo com sucesso ✅"));
}

export async function testSmtpAction() {
  await requireRole(["ADMIN"]);

  // AGORA: getSmtpTransport() devolve {ok, transporter/message}
  const smtp = await getSmtpTransport();
  if (!smtp.ok) redirect(back("danger", smtp.message));

  const to = process.env.SMTP_FROM_EMAIL;
  if (!to) redirect(back("danger", "Defina SMTP_FROM_EMAIL no .env para receber o email de teste."));

  try {
    await smtp.transporter.sendMail({
      from: getFrom(),
      to,
      subject: "Teste SMTP - Advanta CRM",
      text: "SMTP OK ✅",
      html: "<p>SMTP OK ✅</p>",
    });
  } catch (e: any) {
    const msg =
      typeof e?.message === "string" && e.message.length
        ? `Falha no teste SMTP: ${e.message}`
        : "Falha ao enviar email de teste. Verifique host/porta/secure/usuário/senha.";
    redirect(back("danger", msg));
  }

  redirect(back("success", `Email de teste enviado para ${to} ✅`));
}
