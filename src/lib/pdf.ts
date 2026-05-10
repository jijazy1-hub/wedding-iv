import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import QRCode from "qrcode";

export type PdfGuest = {
  Name: string;
  Unique_Code: string;
  Seat_Number?: number;
  imageBase64?: string | null;
};

// Colour palette
const C = {
  ivory:     rgb(0.98, 0.96, 0.90),
  cream:     rgb(0.96, 0.93, 0.85),
  gold:      rgb(0.72, 0.55, 0.22),
  goldLight: rgb(0.90, 0.80, 0.54),
  goldPale:  rgb(0.97, 0.93, 0.80),
  darkGreen: rgb(0.06, 0.18, 0.06),
  ink:       rgb(0.10, 0.09, 0.07),
  inkLight:  rgb(0.28, 0.24, 0.18),
  inkFaint:  rgb(0.50, 0.44, 0.34),
  white:     rgb(1.00, 1.00, 1.00),
};

// Thin horizontal rule
function hRule(page: any, x: number, y: number, w: number, thickness = 0.6) {
  page.drawRectangle({ x, y, width: w, height: thickness, color: C.gold });
}

// Small rotated square (diamond shape)
function diamond(page: any, cx: number, cy: number, size = 5) {
  page.drawRectangle({
    x: cx - size / 2,
    y: cy - size / 2,
    width: size,
    height: size,
    color: C.gold,
    rotate: degrees(45),
  });
}

// Ornamental divider with diamonds
function divider(page: any, x: number, y: number, w: number) {
  const mid = x + w / 2;
  const dw = 8;
  hRule(page, x, y + 2, (w - dw * 2) / 2 - 6);
  diamond(page, mid - dw, y + 2.5, 5);
  diamond(page, mid,      y + 2.5, 7);
  diamond(page, mid + dw, y + 2.5, 5);
  hRule(page, mid + dw * 2 + 6, y + 2, (w - dw * 2) / 2 - 6);
}

// Corner bracket ornament
function cornerBracket(
  page: any,
  x: number, y: number,
  flipX: boolean, flipY: boolean,
  len = 28, thick = 2
) {
  page.drawRectangle({
    x: flipX ? x - len : x,
    y: flipY ? y - thick : y,
    width: len, height: thick, color: C.gold,
  });
  page.drawRectangle({
    x: flipX ? x - thick : x,
    y: flipY ? y - len : y,
    width: thick, height: len, color: C.gold,
  });
  diamond(page, x, y, 6);
}

// Approximate centred text (Helvetica char width ~0.52 * size)
function drawCentred(
  page: any,
  text: string,
  y: number,
  font: any,
  size: number,
  color: any,
  pageWidth: number,
  xShift = 0
) {
  const approxW = text.length * size * 0.52;
  const x = (pageWidth - approxW) / 2 + xShift;
  page.drawText(text, { x, y, size, font, color });
}

export async function createWeddingCardPdf(guest: PdfGuest) {
  const pdfDoc  = await PDFDocument.create();
  const W = 620, H = 950;
  const page    = pdfDoc.addPage([W, H]);
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const oblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const weddingTitle = process.env.NEXT_PUBLIC_WEDDING_TITLE || "Gabby & Esther";
  const weddingDate  = process.env.NEXT_PUBLIC_WEDDING_DATE  || "Saturday, 14th December 2024";
  const weddingVenue = process.env.NEXT_PUBLIC_WEDDING_VENUE || "The Grand Ballroom, Eko Hotel & Suites";
  const weddingTime  = process.env.NEXT_PUBLIC_WEDDING_TIME  || "12:00 PM";

  // QR code
  const qrDataUrl = await QRCode.toDataURL(guest.Unique_Code, {
    margin: 1, width: 200,
    color: { dark: "#111109", light: "#FAF7EE" },
  });
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrDataUrl.split(",")[1], "base64"));

  // BACKGROUND
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.ivory });
  page.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, color: C.cream });

  // Double border
  page.drawRectangle({ x: 18, y: 18, width: W - 36, height: H - 36,
    borderColor: C.darkGreen, borderWidth: 2.5, color: C.cream });
  page.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56,
    borderColor: C.gold, borderWidth: 0.8, color: undefined });

  // Corner brackets
  const bOff = 36;
  cornerBracket(page, bOff,     H - bOff, false, false);
  cornerBracket(page, W - bOff, H - bOff, true,  false);
  cornerBracket(page, bOff,     bOff,     false, true);
  cornerBracket(page, W - bOff, bOff,     true,  true);

  // DARK HEADER PANEL
  const headerH = 210;
  const headerY = H - 28 - headerH;

  page.drawRectangle({ x: 28, y: headerY, width: W - 56, height: headerH, color: C.darkGreen });
  page.drawRectangle({ x: 28, y: headerY + headerH - 4, width: W - 56, height: 4, color: C.gold });
  page.drawRectangle({ x: 28, y: headerY, width: W - 56, height: 4, color: C.gold });

  // Inner gold frame inside header
  page.drawRectangle({
    x: 40, y: headerY + 14, width: W - 80, height: headerH - 28,
    borderColor: C.goldLight, borderWidth: 0.5,
  });

  // Header text - pure ASCII only
  drawCentred(page, "-- WEDDING INVITATION --", headerY + headerH - 55,
    bold, 9, C.goldLight, W);
  drawCentred(page, weddingTitle, headerY + headerH - 110,
    bold, 38, C.goldPale, W);
  hRule(page, 90, headerY + headerH - 120, W - 180);
  drawCentred(page, "Together with their families, request the pleasure of your company",
    headerY + headerH - 142, oblique, 9, C.goldLight, W);
  drawCentred(page, "* RSVP ADMISSION CARD *", headerY + 18, bold, 9, C.goldLight, W);

  // GUEST PHOTO
  const photoSize = 120;
  const photoX = W - photoSize - 55;
  const photoY = headerY - photoSize / 2;

  if (guest.imageBase64) {
    try {
      const [hdr, b64] = guest.imageBase64.split(",");
      const mime = hdr.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      const buf  = Buffer.from(b64, "base64");
      const img  = mime === "image/png"
        ? await pdfDoc.embedPng(buf)
        : await pdfDoc.embedJpg(buf);

      page.drawRectangle({ x: photoX - 5, y: photoY - 5,
        width: photoSize + 10, height: photoSize + 10, color: C.darkGreen });
      page.drawRectangle({ x: photoX - 3, y: photoY - 3,
        width: photoSize + 6, height: photoSize + 6, color: C.gold });
      page.drawRectangle({ x: photoX - 1, y: photoY - 1,
        width: photoSize + 2, height: photoSize + 2, color: C.white });
      page.drawImage(img, { x: photoX, y: photoY, width: photoSize, height: photoSize });

      const lx = photoX + photoSize / 2 - 18;
      page.drawRectangle({ x: photoX - 3, y: photoY - 22,
        width: photoSize + 6, height: 18, color: C.darkGreen });
      page.drawText("G U E S T", {
        x: lx, y: photoY - 16, size: 7, font: bold, color: C.goldLight,
      });
    } catch (e) {
      console.error("Photo embed failed:", e);
    }
  }

  // GUEST DETAILS
  const detailX = 55;
  const detailW = guest.imageBase64 ? photoX - detailX - 20 : W - 110;
  let cy = headerY - 50;

  const fieldLabel = (label: string, y: number) =>
    page.drawText(label, { x: detailX, y, size: 8, font: bold, color: C.gold });

  const fieldValue = (value: string, y: number, maxW = 300) =>
    page.drawText(value, { x: detailX, y: y - 17, size: 15, font: bold, color: C.ink, maxWidth: maxW });

  fieldLabel("GUEST NAME", cy);
  fieldValue(guest.Name, cy, detailW);

  cy -= 52;
  fieldLabel("SEAT NUMBER", cy);
  fieldValue(String(guest.Seat_Number ?? "TBA"), cy, detailW);

  cy -= 52;
  fieldLabel("UNIQUE CODE", cy);
  const codeBadgeY = cy - 20;
  page.drawRectangle({ x: detailX, y: codeBadgeY, width: 160, height: 22, color: C.darkGreen });
  page.drawText(guest.Unique_Code, {
    x: detailX + 10, y: codeBadgeY + 7, size: 11, font: bold, color: C.goldPale,
  });

  // DIVIDER 1
  const divY = headerY - 220;
  divider(page, 55, divY, W - 110);

  // EVENT DETAILS
  const evY = divY - 30;
  const col1X = 55, col2X = W / 2 + 10;

  page.drawText("DATE", { x: col1X, y: evY, size: 8, font: bold, color: C.gold });
  page.drawText(weddingDate, { x: col1X, y: evY - 18, size: 11, font: bold, color: C.ink, maxWidth: 240 });

  page.drawText("TIME", { x: col2X, y: evY, size: 8, font: bold, color: C.gold });
  page.drawText(weddingTime, { x: col2X, y: evY - 18, size: 11, font: bold, color: C.ink });

  page.drawRectangle({ x: W / 2 - 1, y: evY - 22, width: 0.6, height: 36, color: C.goldLight });

  const venY = evY - 68;
  page.drawText("VENUE", { x: col1X, y: venY, size: 8, font: bold, color: C.gold });
  page.drawText(weddingVenue, { x: col1X, y: venY - 18, size: 11, font: bold, color: C.ink, maxWidth: W - 110 });

  // DIVIDER 2
  const div2Y = venY - 60;
  divider(page, 55, div2Y, W - 110);

  // QR CODE
  const qrSize = 130;
  const qrX = W - qrSize - 55;
  const qrY = div2Y - qrSize - 30;

  page.drawRectangle({ x: qrX - 6, y: qrY - 6, width: qrSize + 12, height: qrSize + 12, color: C.darkGreen });
  page.drawRectangle({ x: qrX - 3, y: qrY - 3, width: qrSize + 6, height: qrSize + 6, color: C.gold });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  drawCentred(page, "SCAN TO VERIFY", qrY - 16, bold, 7, C.inkFaint, W,
    (qrX + qrSize / 2) - W / 2);

  // NOTES
  const noteX = 55;
  const noteY = div2Y - 35;

  page.drawText("DRESS CODE", { x: noteX, y: noteY, size: 8, font: bold, color: C.gold });
  page.drawText("Black Tie / Formal Attire", { x: noteX, y: noteY - 18, size: 11, font: regular, color: C.ink });

  page.drawText("KINDLY NOTE", { x: noteX, y: noteY - 54, size: 8, font: bold, color: C.gold });
  page.drawText("Please present this card at", { x: noteX, y: noteY - 72, size: 10, font: regular, color: C.inkLight });
  page.drawText("the entrance for admission.", { x: noteX, y: noteY - 86, size: 10, font: regular, color: C.inkLight });

  // FOOTER BAND
  const footerH = 52;
  page.drawRectangle({ x: 28, y: 28, width: W - 56, height: footerH, color: C.darkGreen });
  page.drawRectangle({ x: 28, y: 28 + footerH - 4, width: W - 56, height: 4, color: C.gold });

  drawCentred(page, "We can't wait to celebrate with you!", 44, oblique, 11, C.goldPale, W);
  drawCentred(page, "#" + weddingTitle.replace(/\s*&\s*/, "And").replace(/\s/g, "") + "2024",
    32, bold, 8, C.goldLight, W);

  return pdfDoc.save();
}