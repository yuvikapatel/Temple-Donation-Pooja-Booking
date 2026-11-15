import { revalidatePath } from "next/cache";
import { fail, guard, json, HttpError } from "@/lib/api";
import { mutate } from "@/lib/db";

export async function DELETE(_req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  try {
    await mutate((db) => {
      const before = db.donations.length;
      db.donations = db.donations.filter((d) => d.id !== params.id);
      if (db.donations.length === before) throw new HttpError(404, "Receipt not found.");
    });
    revalidatePath("/donate");
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
