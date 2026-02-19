import { NextResponse } from "next/server";
import fs from "fs/promises";
import forge from "node-forge";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptString } from "@/lib/crypto";
import type { Role } from "@prisma/client";

export const runtime = "nodejs";

function parseP12(p12Bytes: Buffer, password: string) {
  const p12Der = forge.util.createBuffer(p12Bytes.toString("binary"));
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);

  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [];
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || [];

  const cert = certBags[0]?.cert;
  const hasKey = keyBags.length > 0;
  return { cert, hasKey };
}

export async function POST() {
  await requireRole(["ADMIN" as Role]);

  const cfg = await prisma.pjeConfig.findUnique({ where: { id: "main" } });
  if (!cfg?.certPath || !cfg?.certPassEnc) {
    return NextResponse.json({ ok: false, error: "Nenhum certificado configurado" }, { status: 400 });
  }

  const password = decryptString(cfg.certPassEnc);
  const p12Bytes = await fs.readFile(cfg.certPath);

  try {
    const { cert, hasKey } = parseP12(p12Bytes, password);
    if (!cert) {
      return NextResponse.json({ ok: false, error: "Não foi possível ler o certificado" }, { status: 400 });
    }

    const notAfter = cert.validity?.notAfter ? new Date(cert.validity.notAfter) : null;
    const notBefore = cert.validity?.notBefore ? new Date(cert.validity.notBefore) : null;
    const now = new Date();
    const expired = !!(notAfter && now > notAfter);
    const notYetValid = !!(notBefore && now < notBefore);

    return NextResponse.json({
      ok: !expired && !notYetValid && hasKey,
      hasKey,
      notBefore: notBefore?.toISOString() || null,
      notAfter: notAfter?.toISOString() || null,
      expired,
      notYetValid,
      filename: cfg.certFilename || null,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "Senha incorreta ou arquivo inválido" }, { status: 400 });
  }
}
