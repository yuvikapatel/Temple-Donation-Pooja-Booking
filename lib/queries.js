// Read-side helpers shared by server components and route handlers.
import { readDb } from "./db";
import { addDays, slotPassed, todayIST } from "./format";

// A booking being paid for keeps its seat for 15 minutes
export const HOLD_MS = 15 * 60 * 1000;

const paidTotal = (rows) => rows.reduce((s, r) => s + r.amount, 0);

/** Packages plus how much each has raised so far. */
export async function getPackages({ activeOnly = true } = {}) {
  const db = await readDb();
  return db.packages
    .filter((p) => !activeOnly || p.active)
    .map((p) => {
      const mine = db.donations.filter((d) => d.packageId === p.id && d.status === "paid");
      return { ...p, raised: paidTotal(mine), donors: mine.length };
    });
}

export async function getPackage(id) {
  return (await getPackages({ activeOnly: false })).find((p) => p.id === id) || null;
}

export async function getPoojas() {
  return (await readDb()).poojas;
}

/** Everything the receipts dashboard needs: donations and bookings in one list, newest first. */
export async function getReceipts() {
  const db = await readDb();
  const donations = db.donations.map((d) => ({
    id: d.id, type: "Donation", name: d.name, phone: d.phone, email: d.email,
    title: d.packageTitle, amount: d.amount, status: d.status, method: d.method, createdAt: d.createdAt,
  }));
  const bookings = db.bookings.map((b) => ({
    id: b.id, type: "Booking", name: b.name, phone: b.phone, email: b.email,
    title: b.poojaTitle, amount: b.amount, status: b.status, method: b.method || "UPI", createdAt: b.createdAt,
  }));
  return [...donations, ...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Booked / remaining seats for each slot of a pooja on a date. Cancelled bookings free the slot. */
export function slotAvailability(db, pooja, date) {
  return pooja.slots.map((time) => {
    const booked = db.bookings.filter(
      (b) => b.poojaId === pooja.id && b.date === date && b.slot === time && b.status !== "cancelled"
    ).length;
    const holds = (db.orders || []).filter(
      (o) => o.kind === "booking" && o.status === "created" && Date.now() - Date.parse(o.createdAt) < HOLD_MS &&
        o.data.poojaId === pooja.id && o.data.date === date && o.data.slot === time
    ).length;
    const left = Math.max(0, pooja.capacity - booked - holds);
    return { time, booked: booked + holds, left, capacity: pooja.capacity, closed: slotPassed(date, time), full: left === 0 };
  });
}

export async function getDashboard() {
  const db = await readDb();
  const today = todayIST();
  const receipts = await getReceipts();
  const paid = receipts.filter((r) => r.status !== "cancelled" && r.status !== "refunded");
  const donationTotal = paidTotal(db.donations.filter((d) => d.status === "paid"));
  const bookingTotal = paidTotal(db.bookings.filter((b) => b.status !== "cancelled"));
  const upcoming = db.bookings.filter((b) => b.date >= today && b.status !== "cancelled").sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
  // Last 7 days of income for the bar chart (IST dates)
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const series = days.map((day) => {
    const ofDay = paid.filter((r) => new Date(new Date(r.createdAt).getTime() + 19800000).toISOString().slice(0, 10) === day);
    return { day, total: paidTotal(ofDay) };
  });
  const byPackage = db.packages
    .map((p) => ({ title: p.title, icon: p.icon, total: paidTotal(db.donations.filter((d) => d.packageId === p.id)) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  return {
    donationTotal, bookingTotal, donationCount: db.donations.length,
    upcomingCount: upcoming.length, nextBookings: upcoming.slice(0, 5),
    pendingCount: db.bookings.filter((b) => b.status === "pending").length,
    series, byPackage, recent: receipts.slice(0, 6),
  };
}
