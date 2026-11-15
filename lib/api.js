import { NextResponse } from "next/server";
import { isAdmin } from "./session";

export const json = (data, status = 200) => NextResponse.json(data, { status });

export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** Returns a 401 response when the caller is not the admin, otherwise null. */
export async function guard() {
  return (await isAdmin()) ? null : json({ error: "Please sign in as admin." }, 401);
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Invalid request body.");
  }
}

export function fail(err) {
  if (err instanceof HttpError) return json({ error: err.message, fields: err.fields }, err.status);
  console.error(err);
  return json({ error: "Something went wrong. Please try again." }, 500);
}
