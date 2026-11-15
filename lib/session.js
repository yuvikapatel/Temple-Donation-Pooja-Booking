import { cookies } from "next/headers";
import { COOKIE, verifyToken } from "./auth";

/** Server-side check used by pages and route handlers (defence in depth on top of middleware). */
export async function isAdmin() {
  return verifyToken(cookies().get(COOKIE)?.value);
}
