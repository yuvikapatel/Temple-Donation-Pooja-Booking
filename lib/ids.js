import { randomBytes } from "crypto";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no look-alike characters

/** Unguessable receipt number, e.g. DN-20261115-K7QX3M */
export function makeId(prefix, date = new Date()) {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Array.from(randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${prefix}-${ymd}-${rand}`;
}
