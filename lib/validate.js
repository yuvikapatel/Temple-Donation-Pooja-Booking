// Shared validation – used by the forms (instant feedback) AND the API routes (trust boundary).
import { addDays, slotPassed, todayIST } from "./format";

const clean = (v, max) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_AMOUNT = 1000000;
export const BOOKING_WINDOW_DAYS = 90;

function contact(b, errors) {
  const name = clean(b.name, 60);
  const phone = String(b.phone ?? "").replace(/[\s-]/g, "").replace(/^(\+91|91)(?=\d{10}$)/, "");
  const email = clean(b.email, 100).toLowerCase();
  if (name.length < 2) errors.name = "Enter your full name.";
  else if (!/^[\p{L}\s.'-]+$/u.test(name)) errors.name = "Use letters only in the name.";
  if (!PHONE.test(phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (!EMAIL.test(email)) errors.email = "Enter a valid email address.";
  return { name, phone, email };
}

export function validateDonation(b, pkg) {
  const errors = {};
  const c = contact(b, errors);
  const amount = Math.round(Number(b.amount));
  if (!Number.isFinite(amount) || amount < 1) errors.amount = "Enter an amount of ₹1 or more.";
  else if (amount > MAX_AMOUNT) errors.amount = "For gifts above ₹10,00,000, please contact the temple office.";
  const method = ["UPI", "Card", "Net banking"].includes(b.method) ? b.method : "UPI";
  return {
    errors,
    data: { ...c, amount, method, message: clean(b.message, 240), anonymous: Boolean(b.anonymous) },
  };
}

export function validateBooking(b, pooja, today = todayIST()) {
  const errors = {};
  const c = contact(b, errors);
  const date = clean(b.date, 10);
  const slot = clean(b.slot, 5);
  const devotees = Math.round(Number(b.devotees));
  if (!pooja) errors.poojaId = "Choose a pooja.";
  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) errors.date = "Pick a date.";
  else if (date < today) errors.date = "Pick today or a future date.";
  else if (date > addDays(today, BOOKING_WINDOW_DAYS)) errors.date = `Bookings open ${BOOKING_WINDOW_DAYS} days ahead.`;
  if (pooja && !pooja.slots.includes(slot)) errors.slot = "Choose a time slot.";
  else if (pooja && !errors.date && slotPassed(date, slot)) errors.slot = "That slot has already started. Pick another.";
  if (!Number.isInteger(devotees) || devotees < 1 || devotees > 10) errors.devotees = "Devotees must be between 1 and 10.";
  return {
    errors,
    data: { ...c, date, slot, devotees, gotra: clean(b.gotra, 40), note: clean(b.note, 240) },
  };
}

export function validatePackage(b) {
  const errors = {};
  const title = clean(b.title, 60);
  const description = clean(b.description, 300);
  const category = clean(b.category, 30);
  const icon = clean(b.icon, 4) || "🪔";
  const amount = Math.round(Number(b.amount));
  const allowCustom = true; // every package accepts any amount
  const min = 0;
  const goal = b.goal === "" || b.goal == null ? 0 : Math.round(Number(b.goal));
  if (title.length < 3) errors.title = "Title needs at least 3 characters.";
  if (description.length < 10) errors.description = "Add a short description (10+ characters).";
  if (!category) errors.category = "Choose or type a category.";
  if (!Number.isFinite(amount) || amount < 1 || amount > MAX_AMOUNT) errors.amount = "Enter an amount between ₹1 and ₹10,00,000.";
  if (!Number.isFinite(goal) || goal < 0) errors.goal = "Goal must be zero or more.";
  return {
    errors,
    data: { title, description, category, icon, amount, allowCustom, min, goal, active: b.active !== false, featured: Boolean(b.featured) },
  };
}
