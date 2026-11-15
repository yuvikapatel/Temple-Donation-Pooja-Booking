import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import StatusBadge from "@/components/StatusBadge";
import { readDb } from "@/lib/db";
import { fmtDateTime, fmtISO, fmtTime, inr, maskEmail, maskPhone } from "@/lib/format";
import { SITE } from "@/lib/site";

// Receipts are looked up live, so this page is dynamic and never indexed.
export const dynamic = "force-dynamic";
export const metadata = { title: "Receipt", robots: { index: false, follow: false } };

export default async function ReceiptPage({ params }) {
  const id = params.id.toUpperCase();
  const db = await readDb();
  const donation = id.startsWith("DN-") ? db.donations.find((d) => d.id === id) : null;
  const booking = id.startsWith("BK-") ? db.bookings.find((b) => b.id === id) : null;
  const r = donation || booking;
  if (!r) notFound();

  const isDonation = Boolean(donation);
  // Personal contact details are masked on the public page; anonymous donors are hidden entirely.
  const displayName = isDonation && r.anonymous ? "Anonymous devotee" : r.name;
  const rows = isDonation
    ? [["Donor", displayName], ["Package", r.packageTitle], ["Payment method", r.method], ...(r.paymentId ? [["Payment ID", r.paymentId]] : []), ["Mobile", maskPhone(r.phone)], ["Email", maskEmail(r.email)], ["Date", fmtDateTime(r.createdAt)], ...(r.message ? [["Message", r.message]] : [])]
    : [["Devotee", r.name], ["Pooja", r.poojaTitle], ["Pooja date", fmtISO(r.date)], ["Time", fmtTime(r.slot)], ["Devotees", String(r.devotees)], ...(r.gotra ? [["Gotra", r.gotra]] : []), ["Mobile", maskPhone(r.phone)], ...(r.paymentId ? [["Payment ID", r.paymentId]] : []), ["Booked on", fmtDateTime(r.createdAt)]];

  return (
    <section className="container" style={{ padding: "3rem 0 1rem" }}>
      <div className="no-print" style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div className="success-mark" aria-hidden="true">✓</div>
        <h1 style={{ fontSize: "2rem" }}>{isDonation ? "Thank you for your offering" : "Your pooja is booked"}</h1>
        <p className="muted" style={{ marginTop: ".4rem" }}>Save your receipt number: <b>{r.id}</b></p>
      </div>

      <article className="receipt" aria-label="Receipt">
        <div className="receipt-top">
          <div><b style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>{SITE.name}</b><small>{SITE.address}</small></div>
          <div style={{ textAlign: "right" }}><small>{isDonation ? "Donation receipt" : "Booking receipt"}</small><b>{r.id}</b></div>
        </div>
        <div className="receipt-body">
          <div className="receipt-amount"><span className="muted">{isDonation ? "Amount received" : "Pooja fee"}</span><b>{inr(r.amount)}</b><StatusBadge status={r.status} /></div>
          <dl>{rows.map(([k, v]) => <div key={k} style={{ display: "contents" }}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </div>
        <div className="receipt-foot">This is a computer-generated receipt. For help call {SITE.phone}.</div>
      </article>

      <div className="no-print" style={{ display: "flex", gap: ".75rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <PrintButton />
        <Link href={isDonation ? "/donate" : "/booking"} className="btn btn-ghost">{isDonation ? "Donate again" : "Book another pooja"}</Link>
        <Link href="/" className="btn btn-ghost">Home</Link>
      </div>
    </section>
  );
}
