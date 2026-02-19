"use server";

import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getFrom, getSmtpTransport } from "@/lib/mailer";

function sha256(x: string) {
  return createHash("sha256").update(x).digest("hex");
}

export async function sendSetPasswordLink(userId: string): Promise<{ ok: boolean; message: string }> {
  await requireRole(["ADMIN"]);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, message: "Usuário não encontrado." };

  const smtp = await getSmtpTransport();
  if (!smtp.ok) return { ok: false, message: smtp.message };

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const link = `${appUrl}/set-password?token=${rawToken}`;

  try {
    await smtp.transporter.sendMail({
      from: getFrom(),
      to: user.email,
      subject: "Defina sua senha - Advanta CRM",
      html: `
        <p>Olá, ${user.name}.</p>
        <p>Clique no link abaixo para definir sua senha:</p>
        <p><a href="${link}">Definir senha</a></p>
        <p>Este link expira em 2 horas.</p>
      `,
    });
  } catch {
    return { ok: false, message: "Falha ao enviar email. Verifique SMTP e tente novamente." };
  }

  return { ok: true, message: `Link enviado para ${user.email}.` };
}
