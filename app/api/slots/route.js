import { fail, json, HttpError } from "@/lib/api";
import { readDb } from "@/lib/db";
import { slotAvailability } from "@/lib/queries";

// Public: seat availability for one pooja on one date
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || "";
    const db = await readDb();
    const pooja = db.poojas.find((p) => p.id === searchParams.get("poojaId"));
    if (!pooja) throw new HttpError(404, "Pooja not found.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError(422, "Date must be YYYY-MM-DD.");
    return json({ slots: slotAvailability(db, pooja, date) });
  } catch (err) {
    return fail(err);
  }
}
