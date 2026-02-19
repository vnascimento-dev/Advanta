import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const c = await prisma.client.findUnique({ where: { id: params.id } });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = new PDFDocument({ margin: 40 });
  const chunks: Buffer[] = [];

  doc.on("data", (d) => chunks.push(d));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  doc.fontSize(18).text("Ficha do Cliente", { bold: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#555").text(`ID: ${c.id}`);
  doc.moveDown();

  doc.fillColor("#000").fontSize(12);
  doc.text(`Cliente: ${c.name}`);
  doc.text(`Email: ${c.email ?? "—"}`);
  doc.text(`Whatsapp: ${c.whatsapp ?? "—"}`);
  doc.text(`CPF: ${c.cpf ?? "—"}`);
  doc.text(`Advogado: ${c.advogado ?? "—"}`);
  doc.text(`Prioridade: ${c.prioridade}`);
  doc.text(`Tipo: ${c.tipo ?? "—"}`);
  doc.text(`Status: ${c.status ?? "—"}`);
  doc.text(`ID Processo: ${c.idProcesso ?? "—"}`);
  doc.text(`Data: ${c.data ? new Date(c.data).toLocaleDateString("pt-BR") : "—"}`);
  doc.text(`Data da Audiência: ${c.dataAudiencia ? new Date(c.dataAudiencia).toLocaleString("pt-BR") : "—"}`);
  doc.text(`Link detalhes: ${c.linkDetalhes ?? "—"}`);

  doc.moveDown();
  doc.text("Atividade:", { underline: true });
  doc.moveDown(0.25);
  doc.fontSize(11).text(c.atividade ?? "—");

  doc.end();

  const pdf = await done;

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cliente-${c.id.slice(0, 8)}.pdf"`,
    },
  });
}
