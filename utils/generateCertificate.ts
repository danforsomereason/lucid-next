import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type CertificateProps = {
  userName: string;
  courseName: string;
  ceHours?: number | null;
  completionDate: Date;
  score: number;
};

/** Letter size, landscape (points). */
const PAGE_WIDTH = 792;
const PAGE_HEIGHT = 612;

export async function generateCertificatePdf(
  props: CertificateProps
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawCentered = (
    text: string,
    y: number,
    size: number,
    bold = false
  ) => {
    const font = bold ? fontBold : fontRegular;
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = (PAGE_WIDTH - textWidth) / 2;
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  let y = PAGE_HEIGHT - 72;
  drawCentered('Certificate of Completion', y, 22, true);
  y -= 36;
  drawCentered('This is to certify that', y, 14);
  y -= 32;
  drawCentered(props.userName, y, 18, true);
  y -= 36;
  drawCentered('has successfully completed', y, 14);
  y -= 32;
  drawCentered(props.courseName, y, 18, true);
  y -= 36;
  drawCentered(`with a score of ${props.score}%`, y, 14);
  if (props.ceHours) {
    y -= 28;
    drawCentered(`CE Hours Earned: ${props.ceHours}`, y, 14);
  }
  y -= 28;
  drawCentered(
    `Completion Date: ${props.completionDate.toLocaleDateString()}`,
    y,
    14
  );

  return pdfDoc.save();
}
