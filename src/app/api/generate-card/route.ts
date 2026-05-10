import { createWeddingCardPdf } from "@/lib/pdf";
import { findGuestByUniqueCode } from "@/lib/airtable";

// Accept POST so the client can send the base64 image alongside the code.
// This avoids the unreliable Airtable attachment round-trip entirely.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code ?? "").trim();
    const imageBase64: string | null = body.imageBase64 ?? null;

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
      imageBase64,
    });

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${guest.Name.replace(/\s+/g, "_")}-wedding-card.pdf"`,
      },
    });
  } catch (error) {
    console.error("/api/generate-card error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}