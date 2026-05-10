import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import QRCode from "qrcode";

export type PdfGuest = {
  Name: string;
  Unique_Code: string;
  Seat_Number?: number;
  imageBase64?: string | null;
};

// Sanitize any string before passing to pdf-lib standard fonts.
// Standard fonts use WinAnsi which only supports a subset of Latin chars.
// This replaces common Unicode punctuation with ASCII equivalents,
// then strips anything above 0x7E (printable ASCII range).
function safe(str: string): string {
  return str
    .replace(/[\u2018\u2019\u0060]/g, "'")   // smart single quotes -> '
    .replace(/[\u201C\u201D]/g, '"')           // smart double quotes -> "
    .replace(/[\u2013\u2014]/g, '-')           // en/em dash -> -
    .replace(/\u2026/g, '...')                 // ellipsis -> ...
    .replace(/\u00E9/g, 'e')                   // e acute
    .replace(/\u00E8/g, 'e')
    .replace(/\u00EA/g, 'e')
    .replace(/\u00EB/g, 'e')
    .replace(/\u00E0/g, 'a')
    .replace(/\u00E1/g, 'a')
    .replace(/\u00E2/g, 'a')
    .replace(/\u00E4/g, 'a')
    .replace(/\u00F4/g, 'o')
    .replace(/\u00F6/g, 'o')
    .replace(/\u00FA/g, 'u')
    .replace(/\u00FC/g, 'u')
    .replace(/\u00F1/g, 'n')
    .replace(/\u00C9/g, 'E')
    .replace(/\u00C0/g, 'A')
    .replace(/\u00C1/g, 'A')
    .replace(/[^\x20-\x7E]/g, '');            // strip everything else above printable ASCII
}

// Thin gold rule
function hRule(page: any, x: number, y: number, w: number, h = 0.7) {
  page.drawRectangle({ x, y, width: w, height: h, color: C.gold });
}

// Diamond shape (rotated square)
function diamond(page: any, cx: number, cy: number, size = 5) {
  page.drawRectangle({
    x: cx - size / 2, y: cy - size / 2,
    width: size, height: size,
    color: C.gold, rotate: degrees(45),
  });
}

// Ornamental divider  ---<>---<>---<>---
function divider(page: any, x: number, y: number, w: number) {
  const mid = x + w / 2;
  const gap = 8;
  hRule(page, x, y + 2, (w / 2) - gap * 2 - 4);
  diamond(page, mid - gap * 2, y + 2.5, 5);
  diamond(page, mid,           y + 2.5, 8);
  diamond(page, mid + gap * 2, y + 2.5, 5);
  hRule(page, mid + gap * 2 + 8, y + 2, (w / 2) - gap * 2 - 4);
}

// Corner bracket ornament
function corner(page: any, x: number, y: number, fx: boolean, fy: boolean, len = 28, t = 2) {
  page.drawRectangle({ x: fx ? x - len : x, y: fy ? y - t : y, width: len, height: t, color: C.gold });
  page.drawRectangle({ x: fx ? x - t : x, y: fy ? y - len : y, width: t, height: len, color: C.gold });
  diamond(page, x, y, 6);
}

// Approximate centered text
function centred(page: any, text: string, y: number, font: any, size: number, color: any, W: number, shift = 0) {
  const x = (W - text.length * size * 0.52) / 2 + shift;
  page.drawText(text, { x, y, size, font, color });
}

// Colours
const C = {
  ivory:     rgb(0.98, 0.96, 0.90),
  cream:     rgb(0.96, 0.93, 0.85),
  gold:      rgb(0.72, 0.55, 0.22),
  goldLight: rgb(0.90, 0.80, 0.54),
  goldPale:  rgb(0.97, 0.93, 0.80),
  darkGreen: rgb(0.06, 0.18, 0.06),
  ink:       rgb(0.10, 0.09, 0.07),
  inkLight:  rgb(0.30, 0.26, 0.20),
  inkFaint:  rgb(0.50, 0.44, 0.34),
  white:     rgb(1.00, 1.00, 1.00),
};

export async function createWeddingCardPdf(guest: PdfGuest) {
  const pdfDoc  = await PDFDocument.create();
  const W = 620, H = 950;
  const page    = pdfDoc.addPage([W, H]);
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const oblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Sanitize ALL dynamic values so nothing can break the encoder
  const title  = safe(process.env.NEXT_PUBLIC_WEDDING_TITLE  || "Gabby & Esther");
  const date   = safe(process.env.NEXT_PUBLIC_WEDDING_DATE   || "Saturday, 14th December 2024");
  const venue  = safe(process.env.NEXT_PUBLIC_WEDDING_VENUE  || "The Grand Ballroom, Eko Hotel & Suites");
  const time   = safe(process.env.NEXT_PUBLIC_WEDDING_TIME   || "12:00 PM");
  const name   = safe(guest.Name);
  const code   = safe(guest.Unique_Code);
  const seat   = safe(String(guest.Seat_Number ?? "TBA"));
  const tag    = safe("#" + title.replace(/\s*&\s*/g, "And").replace(/\s/g, "") + "2024");

  // QR code
  const qrPng   = await QRCode.toDataURL(code, { margin: 1, width: 200,
    color: { dark: "#0f2e0f", light: "#f9f6ee" } });
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrPng.split(",")[1], "base64"));

  // ----------------------------------------------------------------
  // BACKGROUND
  // ----------------------------------------------------------------
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.ivory });
  page.drawRectangle({ x: 20, y: 20, width: W - 40, height: H - 40, color: C.cream });

  // Outer dark border
  page.drawRectangle({ x: 18, y: 18, width: W - 36, height: H - 36,
    borderColor: C.darkGreen, borderWidth: 2.5 });
  // Inner gold hairline
  page.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56,
    borderColor: C.gold, borderWidth: 0.8 });

  // Corner ornaments
  const b = 36;
  corner(page, b,     H - b, false, false);
  corner(page, W - b, H - b, true,  false);
  corner(page, b,     b,     false, true);
  corner(page, W - b, b,     true,  true);

  // ----------------------------------------------------------------
  // HEADER BAND
  // ----------------------------------------------------------------
  const hH = 210, hY = H - 28 - hH;
  page.drawRectangle({ x: 28, y: hY, width: W - 56, height: hH, color: C.darkGreen });
  page.drawRectangle({ x: 28, y: hY + hH - 4, width: W - 56, height: 4, color: C.gold });
  page.drawRectangle({ x: 28, y: hY,           width: W - 56, height: 4, color: C.gold });
  page.drawRectangle({ x: 40, y: hY + 14, width: W - 80, height: hH - 28,
    borderColor: C.goldLight, borderWidth: 0.5 });

  centred(page, "-- WEDDING INVITATION --", hY + hH - 55,  bold,    9,  C.goldLight, W);
  centred(page, title,                      hY + hH - 108, bold,    36, C.goldPale,  W);
  hRule(page, 90, hY + hH - 118, W - 180);
  centred(page, "Together with their families request the pleasure of your company",
    hY + hH - 140, oblique, 9, C.goldLight, W);
  centred(page, "* RSVP ADMISSION CARD *", hY + 18, bold, 9, C.goldLight, W);

  // ----------------------------------------------------------------
  // GUEST PHOTO (straddles header bottom edge)
  // ----------------------------------------------------------------
  const pSz = 120, pX = W - pSz - 55, pY = hY - pSz / 2;

  if (guest.imageBase64) {
    try {
      const [hdr, b64] = guest.imageBase64.split(",");
      const mime = hdr.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      const buf  = Buffer.from(b64, "base64");
      const img  = mime === "image/png" ? await pdfDoc.embedPng(buf) : await pdfDoc.embedJpg(buf);

      // Layered frame: dark shadow -> gold border -> white mat -> photo
      page.drawRectangle({ x: pX - 5, y: pY - 5, width: pSz + 10, height: pSz + 10, color: C.darkGreen });
      page.drawRectangle({ x: pX - 3, y: pY - 3, width: pSz +  6, height: pSz +  6, color: C.gold });
      page.drawRectangle({ x: pX - 1, y: pY - 1, width: pSz +  2, height: pSz +  2, color: C.white });
      page.drawImage(img, { x: pX, y: pY, width: pSz, height: pSz });

      // "GUEST" label badge
      page.drawRectangle({ x: pX - 3, y: pY - 22, width: pSz + 6, height: 18, color: C.darkGreen });
      page.drawText("G U E S T", { x: pX + pSz / 2 - 18, y: pY - 16,
        size: 7, font: bold, color: C.goldLight });
    } catch (e) {
      console.error("Photo embed failed:", e);
    }
  }

  // ----------------------------------------------------------------
  // GUEST DETAILS
  // ----------------------------------------------------------------
  const dX = 55, dW = guest.imageBase64 ? pX - dX - 20 : W - 110;
  let cy = hY - 50;

  const lbl = (t: string, y: number) =>
    page.drawText(t, { x: dX, y, size: 8, font: bold, color: C.gold });
  const val = (t: string, y: number, mw = 300) =>
    page.drawText(t, { x: dX, y: y - 18, size: 15, font: bold, color: C.ink, maxWidth: mw });

  lbl("GUEST NAME", cy);   val(name, cy, dW);
  cy -= 52;
  lbl("SEAT NUMBER", cy);  val(seat, cy, dW);
  cy -= 52;
  lbl("UNIQUE CODE", cy);

  const badgeY = cy - 22;
  page.drawRectangle({ x: dX, y: badgeY, width: 170, height: 24, color: C.darkGreen });
  page.drawRectangle({ x: dX, y: badgeY, width: 170, height: 24, borderColor: C.gold, borderWidth: 0.5 });
  page.drawText(code, { x: dX + 10, y: badgeY + 7, size: 12, font: bold, color: C.goldPale });

  // ----------------------------------------------------------------
  // DIVIDER 1
  // ----------------------------------------------------------------
  const d1Y = hY - 222;
  divider(page, 55, d1Y, W - 110);

  // ----------------------------------------------------------------
  // EVENT DETAILS
  // ----------------------------------------------------------------
  const eY = d1Y - 32;
  const c1 = 55, c2 = W / 2 + 10;

  page.drawText("DATE", { x: c1, y: eY,      size: 8,  font: bold,    color: C.gold });
  page.drawText(date,   { x: c1, y: eY - 18, size: 11, font: bold,    color: C.ink,  maxWidth: 240 });
  page.drawText("TIME", { x: c2, y: eY,      size: 8,  font: bold,    color: C.gold });
  page.drawText(time,   { x: c2, y: eY - 18, size: 11, font: bold,    color: C.ink });
  page.drawRectangle({ x: W / 2 - 1, y: eY - 24, width: 0.7, height: 40, color: C.goldLight });

  const vY = eY - 70;
  page.drawText("VENUE", { x: c1, y: vY,      size: 8,  font: bold,    color: C.gold });
  page.drawText(venue,   { x: c1, y: vY - 18, size: 11, font: bold,    color: C.ink,  maxWidth: W - 110 });

  // ----------------------------------------------------------------
  // DIVIDER 2
  // ----------------------------------------------------------------
  const d2Y = vY - 62;
  divider(page, 55, d2Y, W - 110);

  // ----------------------------------------------------------------
  // QR CODE + NOTES
  // ----------------------------------------------------------------
  const qSz = 130, qX = W - qSz - 55, qY = d2Y - qSz - 30;

  page.drawRectangle({ x: qX - 6, y: qY - 6, width: qSz + 12, height: qSz + 12, color: C.darkGreen });
  page.drawRectangle({ x: qX - 3, y: qY - 3, width: qSz +  6, height: qSz +  6, color: C.gold });
  page.drawImage(qrImage, { x: qX, y: qY, width: qSz, height: qSz });
  centred(page, "SCAN TO VERIFY", qY - 16, bold, 7, C.inkFaint, W, (qX + qSz / 2) - W / 2);

  const nX = 55, nY = d2Y - 35;
  page.drawText("DRESS CODE",           { x: nX, y: nY,      size: 8,  font: bold,    color: C.gold });
  page.drawText("Black Tie / Formal",   { x: nX, y: nY - 18, size: 11, font: regular, color: C.ink });
  page.drawText("KINDLY NOTE",          { x: nX, y: nY - 52, size: 8,  font: bold,    color: C.gold });
  page.drawText("Present this card at", { x: nX, y: nY - 70, size: 10, font: regular, color: C.inkLight });
  page.drawText("the entrance.",        { x: nX, y: nY - 84, size: 10, font: regular, color: C.inkLight });

  // ----------------------------------------------------------------
  // FOOTER BAND
  // ----------------------------------------------------------------
  const fH = 52;
  page.drawRectangle({ x: 28, y: 28,          width: W - 56, height: fH, color: C.darkGreen });
  page.drawRectangle({ x: 28, y: 28 + fH - 4, width: W - 56, height: 4,  color: C.gold });
  centred(page, "We look forward to celebrating with you!", 44, oblique, 11, C.goldPale, W);
  centred(page, tag, 32, bold, 8, C.goldLight, W);

  return pdfDoc.save();
}