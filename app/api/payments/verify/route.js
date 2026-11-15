import { revalidatePath } from "next/cache";
import { fail, json, readJson, HttpError } from "@/lib/api";
import { mutate } from "@/lib/db";
import { completeOrder } from "@/lib/payments";
import { verifyPaymentSignature } from "@/lib/razorpay";

// Step 2: the browser sends back what Razorpay Checkout returned. We only trust it if the signature matches.
export async function POST(req) {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = await readJson(req);
    if (!orderId || !paymentId || !verifyPaymentSignature(orderId, paymentId, signature)) {
      throw new HttpError(400, "Payment could not be verified. If money was deducted, it will be refunded or confirmed by the temple office.");
    }
    const order = await mutate((db) => completeOrder(db, orderId, paymentId));
    revalidatePath("/donate");
    revalidatePath("/");
    return json({ id: order.receiptId, kind: order.kind });
  } catch (err) {
    return fail(err);
  }
}
