// Razorpay helpers. Uses Razorpay's REST API directly (no extra npm package) and Node's crypto for signatures.
import crypto from "crypto";
import { HttpError } from "./api";

const API = "https://api.razorpay.com/v1";

export const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

/** Creates a Razorpay order. `amount` is in rupees; Razorpay wants paise. */
export async function createOrder({ amount, receipt, notes }) {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  let res;
  try {
    res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(amount * 100), currency: "INR", receipt, notes }),
    });
  } catch {
    throw new HttpError(502, "Could not reach the payment service. Please try again.");
  }
  if (!res.ok) {
    console.error("Razorpay order error:", res.status, await res.text().catch(() => ""));
    throw new HttpError(502, "Could not start the payment. Please try again in a moment.");
  }
  return res.json();
}

function safeEqualHex(a, b) {
  const x = Buffer.from(String(a), "utf8");
  const y = Buffer.from(String(b), "utf8");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Checks the signature Razorpay Checkout returns after a successful payment. */
export function verifyPaymentSignature(orderId, paymentId, signature) {
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature || "");
}

/** Checks the X-Razorpay-Signature header on a webhook call (computed over the raw body). */
export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  return safeEqualHex(crypto.createHmac("sha256", secret).update(rawBody).digest("hex"), signature || "");
}
