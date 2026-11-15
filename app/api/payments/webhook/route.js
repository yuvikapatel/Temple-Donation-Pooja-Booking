import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { mutate } from "@/lib/db";
import { completeOrder } from "@/lib/payments";
import { verifyWebhookSignature } from "@/lib/razorpay";

// Safety net: if a devotee pays but closes the tab before step 2, Razorpay calls this URL and the receipt is still created.
// Dashboard setup: Settings > Webhooks > URL = https://YOUR-DOMAIN/api/payments/webhook, events: payment.captured, order.paid
export async function POST(req) {
  const raw = await req.text(); // the signature is calculated over the exact raw body
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    const event = JSON.parse(raw);
    const payment = event?.payload?.payment?.entity;
    if (["payment.captured", "order.paid"].includes(event.event) && payment?.order_id) {
      await mutate((db) => completeOrder(db, payment.order_id, payment.id));
      revalidatePath("/donate");
    }
  } catch (err) {
    if (err?.status !== 404) console.error("Webhook error:", err); // unknown orders are fine; just acknowledge
  }
  return NextResponse.json({ ok: true });
}
