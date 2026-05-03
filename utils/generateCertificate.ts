import PDFDocument from 'pdfkit';

export const generateCertificate = async (props: {
  userName: string;
  courseName: string;
  ceHours?: number | null;
  completionDate: Date;
  score: number;
}): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'landscape'
    });

    // Collect the PDF data chunks
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Add content to the PDF
    doc.fontSize(25)
      .text('Certificate of Completion', { align: 'center' });

    doc.moveDown();
    doc.fontSize(15)
      .text(`This is to certify that`, { align: 'center' });

    doc.moveDown();
    doc.fontSize(20)
      .text(props.userName, { align: 'center' });

    doc.moveDown();
    doc.fontSize(15)
      .text(`has successfully completed`, { align: 'center' });

    doc.moveDown();
    doc.fontSize(20)
      .text(props.courseName, { align: 'center' });

    doc.moveDown();
    doc.fontSize(15)
      .text(`with a score of ${props.score}%`, { align: 'center' });

    if (props.ceHours) {
      doc.moveDown();
      doc.text(`CE Hours Earned: ${props.ceHours}`, { align: 'center' });
    }

    doc.moveDown();
    doc.text(`Completion Date: ${props.completionDate.toLocaleDateString()}`, { align: 'center' });

    // Finalize the PDF
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}; 