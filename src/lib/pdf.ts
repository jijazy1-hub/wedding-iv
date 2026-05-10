import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export type PdfGuest = {
  Name: string;
  Unique_Code: string;
  Seat_Number?: number;
  imageBase64?: string | null; // full data URI e.g. "data:image/jpeg;base64,..."
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

  const weddingTitle = process.env.NEXT_PUBLIC_WEDDING_TITLE || "Gabby & Esther";
  const weddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE || "Saturday, 14th December 2024";
  const weddingVenue = process.env.NEXT_PUBLIC_WEDDING_VENUE || "The Grand Ballroom, Eko Hotel & Suites";
  const weddingTime = process.env.NEXT_PUBLIC_WEDDING_TIME || "12:00 PM";

  // ── Outer border ──────────────────────────────────────────────
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: rgb(0.22, 0.16, 0.08),
    borderWidth: 1,
  });

  // ── Header band ───────────────────────────────────────────────
  page.drawRectangle({
    x: 32,
    y: height - 170,
    width: width - 64,
    height: 138,
    color: rgb(0.16, 0.12, 0.06),
    borderWidth: 0,
  });

  page.drawText(weddingTitle, {
    x: 50,
    y: height - 110,
    size: 32,
    font: titleFont,
    color: rgb(0.96, 0.88, 0.72),
  });

  page.drawText("RSVP ADMISSION CARD", {
    x: 50,
    y: height - 148,
    size: 11,
    font: titleFont,
    color: rgb(0.75, 0.65, 0.50),
  });

  // ── Guest photo (top-right inside header band) ─────────────────
  const photoSize = 110;
  const photoX = width - photoSize - 50;
  const photoY = height - 170 + 14;

  if (guest.imageBase64) {
    try {
      const [header, b64] = guest.imageBase64.split(",");
      const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      const imgBuf = Buffer.from(b64, "base64");

      const embeddedImage =
        mimeType === "image/png"
          ? await pdfDoc.embedPng(imgBuf)
          : await pdfDoc.embedJpg(imgBuf);

      // White border around photo
      page.drawRectangle({
        x: photoX - 3,
        y: photoY - 3,
        width: photoSize + 6,
        height: photoSize + 6,
        color: rgb(1, 1, 1),
        borderWidth: 0,
      });

      page.drawImage(embeddedImage, {
        x: photoX,
        y: photoY,
        width: photoSize,
        height: photoSize,
      });
    } catch (err) {
      console.error("Failed to embed guest photo:", err);
    }
  }

  // ── Guest details section ─────────────────────────────────────
  const detailsTop = height - 200;

  const field = (label: string, value: string, y: number) => {
    page.drawText(label.toUpperCase(), {
      x: 50,
      y,
      size: 9,
      font: titleFont,
      color: rgb(0.50, 0.40, 0.28),
    });
    page.drawText(value, {
      x: 50,
      y: y - 18,
      size: 15,
      font: textFont,
      color: rgb(0.12, 0.12, 0.12),
    });
  };

  field("Guest Name", guest.Name, detailsTop);
  field("Seat Number", String(guest.Seat_Number ?? "TBA"), detailsTop - 54);
  field("Unique Code", guest.Unique_Code, detailsTop - 108);

  // Divider line
  page.drawRectangle({
    x: 50,
    y: detailsTop - 148,
    width: width - 100,
    height: 1,
    color: rgb(0.85, 0.78, 0.65),
  });

  field("Date & Time", `${weddingDate}  ·  ${weddingTime}`, detailsTop - 172);
  field("Venue", weddingVenue, detailsTop - 226);

  // ── QR code ───────────────────────────────────────────────────
  const qrSize = 150;
  const qrX = width - qrSize - 50;
  const qrY = 100;

  page.drawText("SCAN ON ARRIVAL", {
    x: qrX + 15,
    y: qrY + qrSize + 8,
    size: 8,
    font: titleFont,
    color: rgb(0.50, 0.40, 0.28),
  });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // ── Footer ────────────────────────────────────────────────────
  page.drawText("Please present this card upon arrival.", {
    x: 50,
    y: 90,
    size: 11,
    font: textFont,
    color: rgb(0.28, 0.22, 0.16),
  });

  page.drawText("We look forward to celebrating with you!", {
    x: 50,
    y: 70,
    size: 10,
    font: textFont,
    color: rgb(0.45, 0.35, 0.22),
  });

  return pdfDoc.save();
}