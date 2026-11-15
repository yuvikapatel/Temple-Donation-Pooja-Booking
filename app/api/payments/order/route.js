import { fail, json, readJson, HttpError } from "@/lib/api";
import { mutate } from "@/lib/db";
import { makeId } from "@/lib/ids";
import { pruneOrders } from "@/lib/payments";
import { slotAvailability } from "@/lib/queries";
import { createOrder, razorpayConfigured } from "@/lib/razorpay";
import { SITE } from "@/lib/site";
import { validateBooking, validateDonation } from "@/lib/validate";

// Step 1 of paying: validate everything on the server, hold the seat (for bookings),
// then create a Razorpay order. No receipt exists until the payment is verified.
export async function POST(req) {
  try {
    if (!razorpayConfigured()) throw new HttpError(503, "Online payments are not set up yet. Please contact the temple office.");
    const body = await readJson(req);
    const ref = makeId("OR");

    // A) validate + reserve (serialised, so two people can't take the same last seat)
    const order = await mutate((db) => {
      pruneOrders(db);
      let rec;
      if (body.kind === "donation") {
        const pkg = db.packages.find((p) => p.id === body.packageId && p.active);
        if (!pkg) throw new HttpError(404, "This donation package is no longer available.");
        const { errors, data } = validateDonation(body, pkg);
        if (Object.keys(errors).length) throw new HttpError(422, "Please fix the highlighted fields.", errors);
        rec = { kind: "donation", amount: data.amount, description: pkg.title, data: { ...data, packageId: pkg.id, packageTitle: pkg.title } };
      } else if (body.kind === "booking") {
        const pooja = db.poojas.find((p) => p.id === body.poojaId);
        const { errors, data } = validateBooking(body, pooja);
        if (Object.keys(errors).length) throw new HttpError(422, "Please fix the highlighted fields.", errors);
        const slot = slotAvailability(db, pooja, data.date).find((s) => s.time === data.slot);
        if (slot.full) throw new HttpError(409, "That slot just filled up. Please choose another time.", { slot: "This slot is full." });
        rec = { kind: "booking", amount: pooja.price, description: `${pooja.title}, ${data.date}`, data: { ...data, poojaId: pooja.id, poojaTitle: pooja.title } };
      } else {
        throw new HttpError(400, "Unknown payment type.");
      }
      const row = { ref, status: "created", createdAt: new Date().toISOString(), ...rec };
      db.orders.push(row);
      return row;
    });

    // B) create the order at Razorpay (outside the db lock because it is a network call)
    let rz;
    try {
      rz = await createOrder({ amount: order.amount, receipt: ref, notes: { kind: order.kind, ref } });
    } catch (err) {
      await mutate((db) => { db.orders = db.orders.filter((o) => o.ref !== ref); }); // release the held seat
      throw err;
    }
    await mutate((db) => {
      const o = db.orders.find((x) => x.ref === ref);
      if (o) o.rzpOrderId = rz.id;
    });

    return json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: rz.id,
      amount: rz.amount,
      name: SITE.name,
      description: order.description,
      prefill: { name: order.data.name, email: order.data.email, contact: order.data.phone },
    });
  } catch (err) {
    return fail(err);
  }
}
