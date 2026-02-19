"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { sendSetPasswordLink } from "@/app/users/invite"; // <- criaremos/uso do invite.ts

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["ADMIN", "ADVOGADO", "ASSISTENTE", "LEITURA"]),
  isActive: z.enum(["true", "false"]).optional().transform((v) => v !== "false"),
});

export async function createUserAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const input = Schema.parse({
    name: formData.get("name"),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    role: formData.get("role"),
    isActive: String(formData.get("isActive") || "true"),
  });

  // senha temporária (o usuário vai definir pelo link)
 const tempPassword = randomBytes(16).toString("hex");

  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const created = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      isActive: input.isActive,
      passwordHash,
    },
  });

  // envia automaticamente o link para definir senha (expira em 2h)
  await sendSetPasswordLink(created.id);

  redirect("/users?invited=1");
}
