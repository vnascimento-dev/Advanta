import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptString } from "@/lib/crypto";
import type { Role } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireRole(["ADMIN" as Role]);

  const form = await req.formData();
  const file = form.get("cert") as File | null;
  const password = String(form.get("password") || "");

  if (!file) return NextResponse.json({ ok: false, error: "Envie o arquivo .pfx/.p12" }, { status: 400 });
  if (!password) return NextResponse.json({ ok: false, error: "Informe a senha do certificado" }, { status: 400 });

  const filename = (file.name || "cert.pfx").replace(/[^a-zA-Z0-9_.-]/g, "_");
  const lower = filename.toLowerCase();
  if (!lower.endsWith(".pfx") && !lower.endsWith(".p12")) {
    return NextResponse.json({ ok: false, error: "Formato inválido. Use .pfx ou .p12" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length < 200) {
    return NextResponse.json({ ok: false, error: "Arquivo muito pequeno / inválido" }, { status: 400 });
  }

  const dir = process.env.PJE_CERT_DIR || path.join(process.cwd(), "storage", "certs");
  await fs.mkdir(dir, { recursive: true });
  const storedPath = path.join(dir, `pje-a1-${Date.now()}-${filename}`);
  await fs.writeFile(storedPath, bytes, { mode: 0o600 });

  await prisma.pjeConfig.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      certFilename: filename,
      certPath: storedPath,
      certPassEnc: encryptString(password),
      updatedById: session.id,
    },
    update: {
      certFilename: filename,
      certPath: storedPath,
      certPassEnc: encryptString(password),
      updatedById: session.id,
    },
  });

  return NextResponse.json({ ok: true });
}
