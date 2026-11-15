// Browser side of the Razorpay flow: create order -> open Checkout -> verify on the server.
import { api } from "./client-api";

function loadCheckout() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the payment window. Check your internet connection."));
    document.body.appendChild(s);
  });
}

/**
 * Resolves with { id } (the receipt number) once the payment is paid AND verified.
 * Rejects with err.cancelled = true if the devotee closes the payment window.
 * `onFailed(message)` is called when an attempt fails but the devotee can still retry inside the window.
 */
export async function payWithRazorpay(payload, { onFailed } = {}) {
  await loadCheckout();
  const order = await api("/api/payments/order", { method: "POST", body: payload });
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: "INR",
      name: order.name,
      description: order.description,
      prefill: order.prefill,
      theme: { color: "#1d1a3b" },
      handler: async (response) => {
        try {
          resolve(await api("/api/payments/verify", { method: "POST", body: response }));
        } catch (err) {
          err.message = `${err.message} Payment ID: ${response.razorpay_payment_id}`;
          reject(err);
        }
      },
      modal: { ondismiss: () => reject(Object.assign(new Error("Payment cancelled."), { cancelled: true })) },
    });
    rzp.on("payment.failed", (r) => onFailed?.(r?.error?.description || "Payment failed. Please try again."));
    rzp.open();
  });
}
