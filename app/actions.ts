"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation"; // ✅ ADD

const ClientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  advogado: z.string().optional().or(z.literal("")),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]).optional(),
  tipo: z.string().optional().or(z.literal("")),
  senhaGovBr: z.string().optional().or(z.literal("")),
  atividade: z.string().optional().or(z.literal("")),
  status: z.string().optional().or(z.literal("")),
  idProcesso: z.string().optional().or(z.literal("")),
  datajudAlias: z.string().optional().or(z.literal("")),
  data: z.string().optional().or(z.literal("")),
  dataAudiencia: z.string().optional().or(z.literal("")),
  linkDetalhes: z.string().optional().or(z.literal("")),
});

export async function createClient(formData: FormData) {
  const me = await requireRole(["ADMIN", "ADVOGADO", "ASSISTENTE"]);

  const data = ClientSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    cpf: formData.get("cpf"),
    whatsapp: formData.get("whatsapp"),
    advogado: formData.get("advogado"),
    prioridade: formData.get("prioridade") || "MEDIA",
    tipo: formData.get("tipo"),
    senhaGovBr: formData.get("senhaGovBr"),
    atividade: formData.get("atividade"),
    status: formData.get("status"),
    idProcesso: formData.get("idProcesso"),
    datajudAlias: formData.get("datajudAlias"),
    data: formData.get("data"),
    dataAudiencia: formData.get("dataAudiencia"),
    linkDetalhes: formData.get("linkDetalhes"),
  });

  const client = await prisma.client.create({
    data: {
      name: data.name,
      email: data.email || null,
      cpf: data.cpf || null,
      whatsapp: data.whatsapp || null,
      advogado: data.advogado || null,
      prioridade: (data.prioridade as any) ?? "MEDIA",
      tipo: data.tipo || null,
      senhaGovBr: data.senhaGovBr || null,
      atividade: data.atividade || null,
      status: data.status || null,
      idProcesso: data.idProcesso || null,
      datajudAlias: data.datajudAlias || null,
      data: data.data ? new Date(data.data) : null,
      dataAudiencia: data.dataAudiencia ? new Date(data.dataAudiencia) : null,
      linkDetalhes: data.linkDetalhes || null,
      createdById: me.id,
    },
  });

  revalidatePath("/clients");
  redirect(`/clients?ok=1&id=${client.id}`); // ✅ volta pra lista com mensagem
}
export async function updateClient(id: string, formData: FormData) {
  await requireRole(["ADMIN", "ADVOGADO", "ASSISTENTE"]);

  const data = ClientSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    cpf: formData.get("cpf"),
    whatsapp: formData.get("whatsapp"),
    advogado: formData.get("advogado"),
    prioridade: formData.get("prioridade") || "MEDIA",
    tipo: formData.get("tipo"),
    senhaGovBr: formData.get("senhaGovBr"),
    atividade: formData.get("atividade"),
    status: formData.get("status"),
    idProcesso: formData.get("idProcesso"),
    datajudAlias: formData.get("datajudAlias"),
    data: formData.get("data"),
    dataAudiencia: formData.get("dataAudiencia"),
    linkDetalhes: formData.get("linkDetalhes"),
  });

  await prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email || null,
      cpf: data.cpf || null,
      whatsapp: data.whatsapp || null,
      advogado: data.advogado || null,
      prioridade: (data.prioridade as any) ?? "MEDIA",
      tipo: data.tipo || null,
      senhaGovBr: data.senhaGovBr || null,
      atividade: data.atividade || null,
      status: data.status || null,
      idProcesso: data.idProcesso || null,
      datajudAlias: data.datajudAlias || null,
      data: data.data ? new Date(data.data) : null,
      dataAudiencia: data.dataAudiencia ? new Date(data.dataAudiencia) : null,
      linkDetalhes: data.linkDetalhes || null,
    },
  });

  revalidatePath("/clients");
  redirect(`/clients?updated=1&id=${id}`);
}


export async function deleteClient(id: string) {
  await requireRole(["ADMIN", "ADVOGADO", "ASSISTENTE"]);

  await prisma.$transaction(async (tx) => {
    // se Process tem onDelete: Restrict, apaga processos antes
    await tx.process.deleteMany({ where: { clientId: id } });
    await tx.client.delete({ where: { id } });
  });

  revalidatePath("/clients");
}
