import { NextResponse } from "next/server";
import { COOKIE, SESSION_HOURS, createToken, credentialsValid } from "@/lib/auth";
import { fail, readJson, HttpError } from "@/lib/api";

// Very small in-memory brute-force guard (per IP). Use Redis/Upstash when deploying to many instances.
const attempts = new Map();
const LIMIT = 5;
const WINDOW = 10 * 60 * 1000;

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const rec = attempts.get(ip);
    if (rec && Date.now() - rec.first < WINDOW && rec.count >= LIMIT) {
      throw new HttpError(429, "Too many attempts. Try again in a few minutes.");
    }
    const { email = "", password = "" } = await readJson(req);
    if (!(await credentialsValid(email, password))) {
      const fresh = !rec || Date.now() - rec.first >= WINDOW;
      attempts.set(ip, { first: fresh ? Date.now() : rec.first, count: fresh ? 1 : rec.count + 1 });
      throw new HttpError(401, "Email or password is incorrect.");
    }
    attempts.delete(ip);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, await createToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_HOURS * 3600,
    });
    return res;
  } catch (err) {
    return fail(err);
  }
}
