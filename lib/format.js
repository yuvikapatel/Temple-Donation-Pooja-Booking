// Pure helpers – safe to import from both server and client components.
const IST_OFFSET = 5.5 * 3600 * 1000;

export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export const fmtDate = (d, opts = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", ...opts });

export const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** Date-only strings ("YYYY-MM-DD") are shown without timezone shifts. */
export const fmtISO = (iso, opts = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { timeZone: "UTC", ...opts });

export const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

/** Today's date in India (YYYY-MM-DD), independent of the server/browser timezone. */
export const todayIST = () => new Date(Date.now() + IST_OFFSET).toISOString().slice(0, 10);

export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** True when a slot's start time has already passed today (IST). */
export const slotPassed = (date, hhmm) => {
  if (date !== todayIST()) return date < todayIST();
  const now = new Date(Date.now() + IST_OFFSET);
  return now.getUTCHours() * 60 + now.getUTCMinutes() >= Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
};

export const maskPhone = (p = "") => (p.length >= 10 ? `${p.slice(0, 2)}******${p.slice(-2)}` : "");
export const maskEmail = (e = "") => {
  const [u, d] = e.split("@");
  return d ? `${u.slice(0, 2)}***@${d}` : "";
};
export const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
