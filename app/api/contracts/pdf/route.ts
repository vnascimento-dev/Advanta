import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // pdfkit precisa de Node runtime

function normalizeCnj(raw?: string | null) {
  if (!raw) return "";
  return raw.replace(/\D/g, "");
}

function serviceLabel(serviceType: string) {
  switch (serviceType) {
    case "CONSULTORIA":
      return "Consultoria Jurídica";
    case "PROCESSUAL":
      return "Atuação Processual";
    case "ADMINISTRATIVO":
      return "Procedimento Administrativo";
    case "TRABALHISTA":
      return "Ação Trabalhista";
    case "PREVIDENCIARIO":
      return "Ação Previdenciária";
    default:
      return "Serviços Jurídicos";
  }
}

function formatPtBR(date = new Date()) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function pdfToBuffer(doc: PDFDocument): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ?? "";
  const serviceType = searchParams.get("serviceType") ?? "CONSULTORIA";
  const valor = (searchParams.get("valor") ?? "").trim();
  const observacoes = (searchParams.get("observacoes") ?? "").trim();

  if (!clientId) {
    return new Response("clientId é obrigatório", { status: 400 });
  }

  const c = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      cpf: true,
      email: true,
      whatsapp: true,
      advogado: true,
      tipo: true,
      idProcesso: true,
    },
  });

  if (!c) {
    return new Response("Cliente não encontrado", { status: 404 });
  }

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 48, left: 48, right: 48, bottom: 48 },
    info: {
      Title: `Contrato - ${c.name}`,
      Author: "Avanta CRM",
    },
  });

  // Header
  if (hasLogo) {
    try {
      doc.image(logoPath, 48, 40, { width: 64 });
    } catch {
      // se falhar, segue sem logo
    }
  }

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS", hasLogo ? 130 : 48, 48, {
      align: "left",
    });

  doc
    .moveDown(0.5)
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#444")
    .text(`Gerado em ${formatPtBR()}`, { align: "right" })
    .fillColor("#000");

  doc.moveDown(1.2);

  const servico = serviceLabel(serviceType);
  const cnj = normalizeCnj(c.idProcesso);

  // Dados principais
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("1. Partes", { underline: false });
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(11);

  doc.text(
    `CONTRATANTE: ${c.name}${c.cpf ? `, CPF: ${c.cpf}` : ""}${c.email ? `, E-mail: ${c.email}` : ""}${c.whatsapp ? `, WhatsApp: ${c.whatsapp}` : ""}.`
  );
  doc.moveDown(0.6);

  // Aqui você pode trocar pelo nome do escritório/advogado cadastrado
  const advogado = c.advogado ? c.advogado : "(Advogado responsável a definir)";
  doc.text(`CONTRATADO: Escritório de Advocacia • Responsável: ${advogado}.`);

  doc.moveDown(1);

  doc.font("Helvetica-Bold").fontSize(12).text("2. Objeto", {});
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(11);
  doc.text(
    `O presente contrato tem por objeto a prestação de serviços advocatícios na modalidade: ${servico}.${
      c.tipo ? ` Natureza/Tipo: ${c.tipo}.` : ""
    }${cnj ? ` Processo (CNJ): ${cnj}.` : ""}`
  );

  doc.moveDown(1);

  doc.font("Helvetica-Bold").fontSize(12).text("3. Honorários", {});
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(11);
  if (valor) {
    doc.text(`Os honorários ajustados para o serviço descrito são de ${valor}, na forma a combinar entre as partes.`);
  } else {
    doc.text(
      "Os honorários serão definidos conforme complexidade do caso, fase processual e tabela interna do escritório, sendo ajustados por escrito entre as partes."
    );
  }

  doc.moveDown(1);
  doc.font("Helvetica-Bold").fontSize(12).text("4. Obrigações e Condições", {});
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(11);
  doc.list(
    [
      "O CONTRATANTE compromete-se a fornecer informações e documentos verdadeiros e completos.",
      "O CONTRATADO atuará com zelo e diligência, sem garantia de resultado específico.",
      "Custas, taxas e despesas de deslocamento (quando aplicável) não estão incluídas nos honorários, salvo ajuste em contrário.",
      "A comunicação poderá ocorrer por e-mail e WhatsApp, conforme dados informados no cadastro.",
    ],
    { bulletRadius: 2 }
  );

  if (observacoes) {
    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").text("Observações:");
    doc.font("Helvetica").text(observacoes);
  }

  doc.moveDown(1.2);
  doc.font("Helvetica-Bold").fontSize(12).text("5. Assinaturas", {});
  doc.moveDown(1);

  const y = doc.y;
  doc
    .font("Helvetica")
    .fontSize(11)
    .text("________________________________________", 48, y)
    .text("CONTRATANTE", 48, y + 18);

  doc
    .text("________________________________________", 320, y)
    .text("CONTRATADO", 320, y + 18);

  doc.moveDown(2);
  doc
    .fontSize(9)
    .fillColor("#666")
    .text("Documento gerado automaticamente pelo Avanta CRM.", { align: "center" })
    .fillColor("#000");

  const pdfBuffer = await pdfToBuffer(doc);

  const safeName = (c.name || "cliente")
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
