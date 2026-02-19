"use server";

import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) redirect(`/login?e=credenciais_invalidas&next=${encodeURIComponent(next)}`);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) redirect(`/login?e=credenciais_invalidas&next=${encodeURIComponent(next)}`);

  await createSessionCookie({ id: user.id, email: user.email, name: user.name, role: user.role });
  redirect(next);
}
