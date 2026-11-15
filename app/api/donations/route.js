import { guard, json } from "@/lib/api";
import { readDb } from "@/lib/db";

// Admin: full donation list. (Donations are created only after a verified payment: see /api/payments/*)
export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return json({ donations: (await readDb()).donations });
}
