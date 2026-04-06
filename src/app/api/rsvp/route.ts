import { NextResponse } from "next/server";
import { findGuestByPhone, generateUniqueCode, getNextSeatNumber, updateGuest } from "@/lib/airtable";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const attendance = String(body.attendance || "").trim();

  if (!phone || !email || !attendance) {
    return NextResponse.json({ error: "Phone, email, and attendance selection are required." }, { status: 400 });
  }

  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const guest = await findGuestByPhone(phone);
  if (!guest) {
    return NextResponse.json({ error: "Guest not found. Please verify your phone number first." }, { status: 404 });
  }

  if (guest.RSVP_Status === "Confirmed" || guest.RSVP_Status === "Declined") {
    return NextResponse.json({
      error: "This guest has already submitted an RSVP.",
      guest,
    }, { status: 409 });
  }

  if (attendance === "No") {
    const updated = await updateGuest(guest.id, {
      Email: email,
      RSVP_Status: "Declined",
      Attendance: "No",
    });

    return NextResponse.json({ guest: updated, message: "Sorry you can't make it ❤️" });
  }

  const seatNumber = await getNextSeatNumber();
  const uniqueCode = generateUniqueCode();

  const updated = await updateGuest(guest.id, {
    Email: email,
    RSVP_Status: "Confirmed",
    Attendance: "Yes",
    Seat_Number: seatNumber,
    Unique_Code: uniqueCode,
  });

  return NextResponse.json({ guest: updated, message: "RSVP confirmed! Your card is ready to download." });
}
