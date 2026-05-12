import { NextResponse } from "next/server";
import { findGuestByPhone, generateUniqueCode, getNextSeatNumber, updateGuest } from "@/lib/airtable";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body.phone || "").trim();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    let guest = await findGuestByPhone(phone);
    if (!guest) {
      return NextResponse.json({ error: "You are not invited or your phone is not registered." }, { status: 404 });
    }

    // If guest is confirmed but has no unique code (RSVPed before the fix),
    // generate and save one now so they can download their card.
    if (guest.RSVP_Status === "Confirmed" && !guest.Unique_Code) {
      const uniqueCode = generateUniqueCode();
      const seatNumber = guest.Seat_Number != null ? guest.Seat_Number : await getNextSeatNumber();
      guest = await updateGuest(guest.id, {
        Unique_Code: uniqueCode,
        Seat_Number: seatNumber,
      });
    }

    return NextResponse.json({ guest });
  } catch (error) {
    console.error("/api/check-guest error:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : "Server error") },
      { status: 500 }
    );
  }
}