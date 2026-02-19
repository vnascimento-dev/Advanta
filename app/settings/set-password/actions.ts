"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function sha256(x: string) {
  return crypto.createHash("sha256").update(x).digest("hex");
}

export async function setPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");

  if (!token) throw new Error("Token inválido.");
  if (password.length < 6) throw new Error("Senha muito curta.");
  if (password !== password2) throw new Error("Senhas não conferem.");

  const tokenHash = sha256(token);

  const row = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!row) throw new Error("Link inválido ou expirado.");

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: row.userId },
      data: { passwordHash, isActive: true },
    });

    await tx.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });
  });

  redirect("/login?reset=1");
}
