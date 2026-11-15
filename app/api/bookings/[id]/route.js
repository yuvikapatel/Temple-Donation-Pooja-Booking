import { fail, guard, json, readJson, HttpError } from "@/lib/api";
import { mutate } from "@/lib/db";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

// Admin: change a booking's status
export async function PATCH(req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { status } = await readJson(req);
    if (!STATUSES.includes(status)) throw new HttpError(422, "Unknown status.");
    const booking = await mutate((db) => {
      const b = db.bookings.find((x) => x.id === params.id);
      if (!b) throw new HttpError(404, "Booking not found.");
      b.status = status;
      return b;
    });
    return json({ booking });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(_req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  try {
    await mutate((db) => {
      const before = db.bookings.length;
      db.bookings = db.bookings.filter((b) => b.id !== params.id);
      if (db.bookings.length === before) throw new HttpError(404, "Booking not found.");
    });
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
