import { revalidatePath } from "next/cache";
import { fail, guard, json, readJson, HttpError } from "@/lib/api";
import { mutate } from "@/lib/db";
import { validatePackage } from "@/lib/validate";

function refresh(id) {
  revalidatePath("/");
  revalidatePath("/donate");
  revalidatePath(`/donate/${id}`);
}

export async function PUT(req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { errors, data } = validatePackage(await readJson(req));
    if (Object.keys(errors).length) throw new HttpError(422, "Please fix the highlighted fields.", errors);
    const pkg = await mutate((db) => {
      const i = db.packages.findIndex((p) => p.id === params.id);
      if (i < 0) throw new HttpError(404, "Package not found.");
      db.packages[i] = { id: params.id, ...data };
      return db.packages[i];
    });
    refresh(params.id);
    return json({ package: pkg });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(_req, { params }) {
  const denied = await guard();
  if (denied) return denied;
  try {
    await mutate((db) => {
      if (!db.packages.some((p) => p.id === params.id)) throw new HttpError(404, "Package not found.");
      // Past donations keep their package title, so receipts stay valid after deletion.
      db.packages = db.packages.filter((p) => p.id !== params.id);
    });
    refresh(params.id);
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
