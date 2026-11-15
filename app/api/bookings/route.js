import { guard, json } from "@/lib/api";
import { readDb } from "@/lib/db";

// Admin: all bookings. (Bookings are created only after a verified payment: see /api/payments/*)
export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return json({ bookings: (await readDb()).bookings });
}
