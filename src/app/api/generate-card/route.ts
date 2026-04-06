import { createWeddingCardPdf } from "@/lib/pdf";
import { findGuestByUniqueCode } from "@/lib/airtable";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.trim();

  if (!code) {
    return new Response(JSON.stringify({ error: "Unique code is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const guest = await findGuestByUniqueCode(code);
  if (!guest) {
    return new Response(JSON.stringify({ error: "Invitation card not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const pdfBytes = await createWeddingCardPdf({
    Name: guest.Name,
    Unique_Code: guest.Unique_Code ?? "",
    Seat_Number: guest.Seat_Number,
  });

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${guest.Name.replace(/\s+/g, "_")}-wedding-card.pdf"`,
    },
  });
}
