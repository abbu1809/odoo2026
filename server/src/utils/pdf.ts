import PDFDocument from "pdfkit";
import type { Response } from "express";

interface PdfColumn {
  key: string;
  label: string;
}

/** Streams a simple tabular PDF (title + header row + data rows) straight to the response. */
export function renderTablePdf(
  res: Response,
  opts: { title: string; filename: string; columns: PdfColumn[]; rows: Record<string, unknown>[] },
) {
  const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${opts.filename}`);
  doc.pipe(res);

  doc.fontSize(18).font("Helvetica-Bold").text(opts.title);
  doc.moveDown(0.5);

  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = usableWidth / opts.columns.length;
  let y = doc.y;

  doc.fontSize(9);

  const drawRow = (values: string[], bold = false) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica");
    values.forEach((val, i) => {
      doc.text(val, startX + i * colWidth, y, { width: colWidth - 6, ellipsis: true });
    });
    y += 16;
  };

  drawRow(opts.columns.map((c) => c.label), true);
  doc
    .moveTo(startX, y - 3)
    .lineTo(startX + usableWidth, y - 3)
    .strokeColor("#999999")
    .stroke();
  y += 2;

  for (const row of opts.rows) {
    if (y > doc.page.height - doc.page.margins.bottom - 20) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    drawRow(opts.columns.map((c) => String(row[c.key] ?? "")));
  }

  doc.end();
}
