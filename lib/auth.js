// Edge-safe session signing (Web Crypto) – used by middleware AND route handlers.
export const COOKIE = "temple_admin";
export const SESSION_HOURS = 8;
const enc = new TextEncoder();
const secret = () => process.env.AUTH_SECRET || "dev-only-secret-please-set-AUTH_SECRET";

async function hmac(data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
  let bin = "";
  sig.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Constant-time string comparison (avoids timing attacks)
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createToken() {
  const payload = `admin.${Date.now() + SESSION_HOURS * 3600 * 1000}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyToken(token) {
  if (!token) return false;
  const [role, exp, sig] = token.split(".");
  if (role !== "admin" || !exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(`${role}.${exp}`));
}

export async function credentialsValid(email, password) {
  const wantEmail = process.env.ADMIN_EMAIL || "admin@temple.local";
  const wantPass = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "Temple@123");
  if (!wantPass) return false; // never allow an empty password in production
  const [a, b, c, d] = await Promise.all([hmac(String(email).toLowerCase()), hmac(wantEmail.toLowerCase()), hmac(String(password)), hmac(wantPass)]);
  return safeEqual(a, b) && safeEqual(c, d);
}
