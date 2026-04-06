import { NextResponse } from "next/server";
import { findGuestByPhone } from "@/lib/airtable";

export async function POST(req: Request) {
  const body = await req.json();
  const phone = String(body.phone || "").trim();

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const guest = await findGuestByPhone(phone);
  if (!guest) {
    return NextResponse.json({ error: "You are not invited or your phone is not registered." }, { status: 404 });
  }

  return NextResponse.json({ guest });
}
