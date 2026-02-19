import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/secret";

export type SmtpResult =
  | { ok: true; transporter: any }
  | { ok: false; message: string };

export async function getSmtpTransport(): Promise<SmtpResult> {
  const cfg = await prisma.smtpConfig.findUnique({ where: { id: "main" } });

  if (!cfg?.host || !cfg.port || !cfg.username || !cfg.passwordEnc) {
    return { ok: false, message: "SMTP não configurado. Vá em Configurações > SMTP e salve os dados." };
  }

  let pass = "";
  try {
    pass = decryptSecret(cfg.passwordEnc);
  } catch {
    return { ok: false, message: "Falha ao ler a senha SMTP. Reconfigure a senha em Configurações > SMTP." };
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.username, pass },
  });

  return { ok: true, transporter };
}

export function getFrom() {
  const fromEmail = process.env.SMTP_FROM_EMAIL || "no-reply@localhost";
  const fromName = process.env.SMTP_FROM_NAME ?? "Advanta CRM";
  return `${fromName} <${fromEmail}>`;
}
