"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Calendar from "./Calendar";
import Field from "./Field";
import { useToast } from "./Toast";
import { api } from "@/lib/client-api";
import { payWithRazorpay } from "@/lib/razorpay-client";
import { addDays, fmtISO, fmtTime, inr } from "@/lib/format";
import { BOOKING_WINDOW_DAYS, validateBooking } from "@/lib/validate";

export default function BookingForm({ poojas, today, initialPooja }) {
  const router = useRouter();
  const toast = useToast();
  const [poojaId, setPoojaId] = useState(poojas.some((p) => p.id === initialPooja) ? initialPooja : poojas[0].id);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [tick, setTick] = useState(0); // bump to force a fresh availability fetch
  const [form, setForm] = useState({ name: "", phone: "", email: "", devotees: "1", gotra: "", note: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const pooja = poojas.find((p) => p.id === poojaId);

  // Load seat availability whenever the pooja or date changes
  useEffect(() => {
    setSlot("");
    if (!date) return setSlots(null);
    let cancelled = false;
    setLoadingSlots(true);
    api(`/api/slots?poojaId=${poojaId}&date=${date}`)
      .then((d) => !cancelled && setSlots(d.slots))
      .catch((e) => { if (!cancelled) { setSlots([]); toast(e.message, "error"); } })
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => { cancelled = true; };
  }, [poojaId, date, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e) {
    e.preventDefault();
    const { errors: found } = validateBooking({ ...form, date, slot }, pooja, today);
    setErrors(found);
    if (Object.keys(found).length) return toast("Please complete the highlighted fields.", "error");
    setBusy(true);
    try {
      const { id } = await payWithRazorpay({ kind: "booking", ...form, poojaId, date, slot }, { onFailed: (m) => toast(m, "error") });
      toast("Payment received. Booking confirmed.");
      router.push(`/receipt/${id}`);
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.cancelled ? "Payment cancelled. You have not been charged." : err.message, "error");
      if (err.status === 409) setTick((t) => t + 1); // slot filled up: reload availability
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="two-col">
      <div className="card pad">
        <h2 className="fieldset-title" style={{ fontSize: "1.1rem" }}>1. Choose a pooja</h2>
        <div className="pooja-pick" role="radiogroup" aria-label="Pooja">
          {poojas.map((p) => (
            <label key={p.id}>
              <input type="radio" name="pooja" checked={poojaId === p.id} onChange={() => setPoojaId(p.id)} />
              <span style={{ fontSize: "1.4rem" }} aria-hidden="true">{p.icon}</span>
              <b>{p.title}</b>
              <small>{inr(p.price)} · {p.duration} min</small>
            </label>
          ))}
        </div>
        <p className="muted" style={{ fontSize: ".9rem", marginTop: ".75rem" }}>{pooja.description}</p>

        <h2 className="fieldset-title" style={{ fontSize: "1.1rem" }}>2. Pick a date and time</h2>
        <Calendar value={date} onChange={setDate} min={today} max={addDays(today, BOOKING_WINDOW_DAYS)} />
        {errors.date && <p className="err" style={{ color: "var(--kumkum)", fontSize: ".85rem", marginTop: ".4rem" }} role="alert">{errors.date}</p>}
        <div style={{ marginTop: "1rem" }} aria-live="polite">
          {!date ? <p className="muted" style={{ fontSize: ".9rem" }}>Select a date to see available times.</p>
            : loadingSlots ? <div className="skel" style={{ height: 64 }} aria-label="Loading times" />
            : (
              <div className="slots" role="radiogroup" aria-label="Time slot">
                {(slots || []).map((s) => {
                  const off = s.closed || s.full;
                  return (
                    <button type="button" key={s.time} role="radio" aria-checked={slot === s.time} disabled={off}
                      className={`slot ${slot === s.time ? "sel" : ""}`} onClick={() => setSlot(s.time)}>
                      <b>{fmtTime(s.time)}</b>
                      <small>{s.closed ? "Time passed" : s.full ? "Full" : `${s.left} of ${s.capacity} seats left`}</small>
                    </button>
                  );
                })}
              </div>
            )}
          {errors.slot && <p style={{ color: "var(--kumkum)", fontSize: ".85rem", marginTop: ".4rem" }} role="alert">{errors.slot}</p>}
        </div>

        <h2 className="fieldset-title" style={{ fontSize: "1.1rem" }}>3. Devotee details</h2>
        <div className="row">
          <Field id="b-name" label="Full name" error={errors.name}><input value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></Field>
          <Field id="b-phone" label="Mobile number" error={errors.phone}><input inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></Field>
        </div>
        <div className="row">
          <Field id="b-email" label="Email" error={errors.email}><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></Field>
          <Field id="b-dev" label="Devotees attending" error={errors.devotees}>
            <select value={form.devotees} onChange={(e) => set("devotees", e.target.value)}>
              {Array.from({ length: 10 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
            </select>
          </Field>
        </div>
        <Field id="b-gotra" label="Gotra (optional)" error={errors.gotra}><input value={form.gotra} onChange={(e) => set("gotra", e.target.value)} /></Field>
        <Field id="b-note" label="Note for the priest (optional)" error={errors.note}><textarea value={form.note} maxLength={240} onChange={(e) => set("note", e.target.value)} /></Field>
      </div>

      <aside className="card pad sticky summary">
        <h3 style={{ marginBottom: "1rem" }}>Booking summary</h3>
        <dl>
          <dt>Pooja</dt><dd>{pooja.title}</dd>
          <dt>Date</dt><dd>{date ? fmtISO(date) : "Not selected"}</dd>
          <dt>Time</dt><dd>{slot ? fmtTime(slot) : "Not selected"}</dd>
          <dt>Devotees</dt><dd>{form.devotees}</dd>
        </dl>
        <div className="total"><span className="muted">Pooja fee</span><span className="price">{inr(pooja.price)}</span></div>
        <button className="btn btn-primary btn-block" style={{ marginTop: "1.25rem" }} disabled={busy}>
          {busy ? <><span className="spinner" /> Booking</> : "Pay and confirm"}
        </button>
        <p className="muted" style={{ fontSize: ".8rem", marginTop: ".75rem" }}>You pay securely with Razorpay (UPI, cards or net banking). Your seat is held for 15 minutes while you pay, and your receipt number appears right after payment.</p>
      </aside>
    </form>
  );
}
