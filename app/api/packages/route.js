import { revalidatePath } from "next/cache";
import { fail, guard, json, readJson, HttpError } from "@/lib/api";
import { mutate } from "@/lib/db";
import { getPackages } from "@/lib/queries";
import { slugify } from "@/lib/format";
import { validatePackage } from "@/lib/validate";

// Public: list active packages
export async function GET() {
  return json({ packages: await getPackages() });
}

// Admin: create a package
export async function POST(req) {
  const denied = await guard();
  if (denied) return denied;
  try {
    const { errors, data } = validatePackage(await readJson(req));
    if (Object.keys(errors).length) throw new HttpError(422, "Please fix the highlighted fields.", errors);
    const pkg = await mutate((db) => {
      let id = slugify(data.title) || "package";
      if (db.packages.some((p) => p.id === id)) id = `${id}-${Date.now().toString(36).slice(-4)}`;
      const created = { id, ...data };
      db.packages.push(created);
      return created;
    });
    revalidatePath("/");
    revalidatePath("/donate");
    return json({ package: { ...pkg, raised: 0, donors: 0 } }, 201);
  } catch (err) {
    return fail(err);
  }
}
