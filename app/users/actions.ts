"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const UpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["ADMIN","ADVOGADO","ASSISTENTE","LEITURA"]),
  isActive: z.enum(["true","false"]).transform(v => v === "true"),
  password: z.string().optional().or(z.literal("")),
});

export async function updateUserAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const input = UpdateSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    role: formData.get("role"),
    isActive: String(formData.get("isActive") || "true"),
    password: String(formData.get("password") || ""),
  });

  const data: any = {
    name: input.name,
    email: input.email,
    role: input.role,
    isActive: input.isActive,
  };

  if (input.password && input.password.length >= 6) {
    data.passwordHash = await bcrypt.hash(input.password, 10);
  }

  await prisma.user.update({ where: { id: input.id }, data });

  revalidatePath("/users");
  revalidatePath(`/users/${input.id}/edit`);
}

export async function toggleUserActive(id: string, nextActive: boolean) {
  await requireRole(["ADMIN"]);
  await prisma.user.update({ where: { id }, data: { isActive: nextActive } });
  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  await requireRole(["ADMIN"]);
  // Evita apagar: aqui desativa para manter rastreabilidade
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/users");
}
import { sendSetPasswordLink } from "@/app/users/invite";
import { redirect } from "next/navigation";

const CreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["ADMIN", "ADVOGADO", "ASSISTENTE", "LEITURA"]),
  isActive: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export async function createUserAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const input = CreateSchema.parse({
    name: formData.get("name"),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    role: formData.get("role"),
    isActive: String(formData.get("isActive") || "true"),
  });

  // senha temporária: o usuário vai definir pelo link
  // (não pode ser vazio pois o login usa passwordHash)
  const tempPassword = crypto.randomBytes(16).toString("hex");
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

  // envia link automaticamente
  await sendSetPasswordLink(created.id);

  revalidatePath("/users");
  redirect("/users?invited=1");
}
