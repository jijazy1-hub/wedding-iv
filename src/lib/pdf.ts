import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export type PdfGuest = {
  Name: string;
  Unique_Code: string;
  Seat_Number?: number;
};

export async function createWeddingCardPdf(guest: PdfGuest) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 900]);
  const { width, height } = page.getSize();
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const qrDataUrl = await QRCode.toDataURL(guest.Unique_Code, { margin: 1, width: 180 });
  const qrBase64 = qrDataUrl.split(",")[1];
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrBase64, "base64"));

  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: rgb(0.22, 0.16, 0.08),
    borderWidth: 1,
  });

  const weddingTitle = process.env.NEXT_PUBLIC_WEDDING_TITLE || "Gabby & Esther Wedding";
  const weddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE || "Saturday, 14th December 2024";
  const weddingVenue = process.env.NEXT_PUBLIC_WEDDING_VENUE || "The Grand Ballroom, Eko Hotel & Suites";
  const weddingTime = process.env.NEXT_PUBLIC_WEDDING_TIME || "12:00 PM";

  page.drawText(weddingTitle, {
    x: 50,
    y: height - 100,
    size: 32,
    font: titleFont,
    color: rgb(0.16, 0.12, 0.06),
  });

  page.drawText("RSVP Admission Card", {
    x: 50,
    y: height - 140,
    size: 18,
    font: textFont,
    color: rgb(0.35, 0.24, 0.16),
  });

  page.drawText(`Guest Name: ${guest.Name}`, {
    x: 50,
    y: height - 210,
    size: 16,
    font: textFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText(`Seat Number: ${guest.Seat_Number ?? "TBA"}`, {
    x: 50,
    y: height - 240,
    size: 16,
    font: textFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText(`Unique Code: ${guest.Unique_Code}`, {
    x: 50,
    y: height - 270,
    size: 16,
    font: textFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText(`Date: ${weddingDate} · ${weddingTime}`, {
    x: 50,
    y: height - 320,
    size: 14,
    font: textFont,
    color: rgb(0.18, 0.14, 0.1),
  });

  page.drawText(`Venue: ${weddingVenue}`, {
    x: 50,
    y: height - 340,
    size: 14,
    font: textFont,
    color: rgb(0.18, 0.14, 0.1),
  });

  const qrSize = 170;
  page.drawImage(qrImage, {
    x: width - qrSize - 60,
    y: 110,
    width: qrSize,
    height: qrSize,
  });

  page.drawText("Present this card on arrival.", {
    x: 50,
    y: 90,
    size: 12,
    font: textFont,
    color: rgb(0.28, 0.22, 0.16),
  });

  return pdfDoc.save();
}
