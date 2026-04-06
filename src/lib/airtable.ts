import Airtable from "airtable";

function getBase() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  
  if (!apiKey || !baseId) {
    throw new Error("Missing Airtable environment variables. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.");
  }
  return new Airtable({ apiKey }).base(baseId);
}

function getTableName() {
  return process.env.AIRTABLE_TABLE_NAME || "Wedding RSVP";
}

export type GuestRecord = {
  id: string;
  Name: string;
  Phone: string;
  Email?: string;
  Invited?: boolean;
  RSVP_Status?: string;
  Attendance?: string;
  Seat_Number?: number;
  Unique_Code?: string;
};

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) {
    return `0${digits.slice(3)}`;
  }
  if (digits.startsWith("0")) {
    return digits;
  }
  return digits;
}

function buildGuest(record: any): GuestRecord {
  return {
    id: record.id,
    Name: record.fields.Name || "",
    Phone: record.fields.Phone || "",
    Email: record.fields.Email || "",
    Invited: record.fields.Invited ?? false,
    RSVP_Status: record.fields.RSVP_Status || "Pending",
    Attendance: record.fields.Attendance || "",
    Seat_Number: record.fields.Seat_Number,
    Unique_Code: record.fields.Unique_Code || "",
  };
}

export async function findGuestByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  const formula = `AND({Phone} = "${normalized}", {Invited} = TRUE())`;
  const records = await getBase().table(getTableName())
    .select({ filterByFormula: formula, maxRecords: 1 })
    .firstPage();

  if (!records.length) {
    return null;
  }

  return buildGuest(records[0]);
}

export async function findGuestByUniqueCode(code: string) {
  const formula = `AND({Unique_Code} = "${code}", {Invited} = TRUE())`;
  const records = await getBase().table(getTableName())
    .select({ filterByFormula: formula, maxRecords: 1 })
    .firstPage();

  if (!records.length) {
    return null;
  }

  return buildGuest(records[0]);
}

export async function getNextSeatNumber() {
  const records = await getBase().table(getTableName())
    .select({
      maxRecords: 1,
      sort: [{ field: "Seat_Number", direction: "desc" }],
      filterByFormula: "AND({Seat_Number} > 0, {RSVP_Status} = \"Confirmed\")",
    })
    .firstPage();

  if (!records.length) {
    return 1;
  }

  const value = records[0].fields.Seat_Number;
  return typeof value === "number" ? value + 1 : 1;
}

export async function updateGuest(id: string, fields: Record<string, any>) {
  const [updated] = await getBase().table(getTableName()).update([{ id, fields }]);
  return buildGuest(updated);
}

export function generateUniqueCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let i = 0; i < 6; i += 1) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WED-${token}`;
}
