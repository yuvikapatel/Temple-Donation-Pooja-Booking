// Turns a paid Razorpay order into a receipt. Always call inside `mutate`.
import { HttpError } from "./api";
import { makeId } from "./ids";

const DAY = 864e5;

/** Drop stale unpaid orders (2 days) and old paid ones (30 days) so the file doesn't grow forever. */
export function pruneOrders(db) {
  const now = Date.now();
  db.orders = (db.orders || []).filter((o) => now - Date.parse(o.createdAt) < (o.status === "paid" ? 30 : 2) * DAY);
}

/**
 * Idempotent: the browser callback and the webhook may both arrive; the receipt is only created once.
 * Returns the order (with receiptId).
 */
export function completeOrder(db, rzpOrderId, paymentId) {
  const order = (db.orders || []).find((o) => o.rzpOrderId === rzpOrderId);
  if (!order) throw new HttpError(404, "We could not find this payment order.");
  if (order.status === "paid") return order;

  const createdAt = new Date().toISOString();
  if (order.kind === "donation") {
    const id = makeId("DN");
    db.donations.unshift({ id, ...order.data, amount: order.amount, method: "Razorpay", paymentId, status: "paid", createdAt });
    order.receiptId = id;
  } else {
    const id = makeId("BK");
    db.bookings.unshift({ id, ...order.data, amount: order.amount, method: "Razorpay", paymentId, status: "confirmed", createdAt });
    order.receiptId = id;
  }
  order.status = "paid";
  order.paymentId = paymentId;
  return order;
}
