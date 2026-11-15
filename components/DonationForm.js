"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Field from "./Field";
import { useToast } from "./Toast";
import { payWithRazorpay } from "@/lib/razorpay-client";
import { validateDonation } from "@/lib/validate";
import { inr } from "@/lib/format";

export default function DonationForm({ pkg }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", phone: "", email: "", amount: String(pkg.amount), message: "", anonymous: false });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const presets = [...new Set([101, 501, 1001, 2501, pkg.amount])].sort((a, b) => a - b); // quick picks; donors can type any amount

  async function onSubmit(e) {
    e.preventDefault();
    const { errors: found } = validateDonation(form, pkg); // instant feedback; the server validates again
    setErrors(found);
    if (Object.keys(found).length) return toast("Please fix the highlighted fields.", "error");
    setBusy(true);
    try {
      // Opens Razorpay Checkout; resolves only after the payment is paid and verified on the server
      const { id } = await payWithRazorpay({ kind: "donation", packageId: pkg.id, ...form }, { onFailed: (m) => toast(m, "error") });
      toast("Payment received. Thank you!");
      router.push(`/receipt/${id}`);
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.cancelled ? "Payment cancelled. You have not been charged." : err.message, "error");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="row">
        <Field id="name" label="Full name" error={errors.name}><input value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></Field>
        <Field id="phone" label="Mobile number" error={errors.phone}><input inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="10-digit number" /></Field>
      </div>
      <Field id="email" label="Email" error={errors.email} hint="Used only for your receipt."><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></Field>

      <Field id="amount" label="Amount (₹)" error={errors.amount} hint="Give any amount you wish.">
        <input type="number" inputMode="numeric" min="1" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
      </Field>
      <div className="chips" style={{ marginTop: "-.5rem", marginBottom: "1rem" }}>
        {presets.map((v) => (
          <button type="button" key={v} className={`chip ${Number(form.amount) === v ? "on" : ""}`} onClick={() => set("amount", String(v))}>{inr(v)}</button>
        ))}
      </div>

      <Field id="message" label="Message or sankalpam (optional)" error={errors.message} hint="For example, a name and gotra to be read out.">
        <textarea value={form.message} maxLength={240} onChange={(e) => set("message", e.target.value)} />
      </Field>

      <label className="check" style={{ marginBottom: "1.25rem" }}>
        <input type="checkbox" checked={form.anonymous} onChange={(e) => set("anonymous", e.target.checked)} />
        <span>Keep my name off the public receipt page</span>
      </label>

      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? <><span className="spinner" /> Opening payment</> : `Pay ${inr(Number(form.amount) || 0)}`}
      </button>
      <p className="muted" style={{ fontSize: ".82rem", marginTop: ".75rem", textAlign: "center" }}>Secure payment by Razorpay: UPI, cards and net banking.</p>
    </form>
  );
}
