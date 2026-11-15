import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { getDashboard } from "@/lib/queries";
import { fmtDate, fmtISO, fmtTime, inr } from "@/lib/format";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const d = await getDashboard();
  const max = Math.max(1, ...d.series.map((s) => s.total));

  return (
    <>
      <div className="admin-head">
        <div><h1 style={{ fontSize: "2rem" }}>Dashboard</h1><p>Income and upcoming poojas at a glance.</p></div>
        <Link href="/admin/receipts" className="btn btn-dark">Open receipts</Link>
      </div>

      <div className="kpis">
        <div className="card kpi"><span>Donations</span><b>{inr(d.donationTotal)}</b><small>{d.donationCount} receipts</small></div>
        <div className="card kpi"><span>Pooja income</span><b>{inr(d.bookingTotal)}</b><small>excluding cancelled</small></div>
        <div className="card kpi"><span>Upcoming poojas</span><b>{d.upcomingCount}</b><small>from today onwards</small></div>
        <div className="card kpi"><span>Needs confirming</span><b>{d.pendingCount}</b><small>pending bookings</small></div>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: "1.5fr 1fr", marginBottom: "1.25rem" }}>
        <section className="card pad" aria-labelledby="inc">
          <h2 id="inc" style={{ fontSize: "1.2rem" }}>Income, last 7 days</h2>
          <div className="bars" role="img" aria-label={`Daily income: ${d.series.map((s) => `${fmtISO(s.day, { day: "numeric", month: "short" })} ${inr(s.total)}`).join(", ")}`}>
            {d.series.map((s) => (
              <div className="bar" key={s.day}>
                <span>{s.total ? inr(s.total) : ""}</span>
                <i style={{ height: `${(s.total / max) * 70}%` }} />
                <span>{fmtISO(s.day, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card pad" aria-labelledby="top">
          <h2 id="top" style={{ fontSize: "1.2rem", marginBottom: ".5rem" }}>Top packages</h2>
          <ul className="list-plain">
            {d.byPackage.map((p) => <li key={p.title}><span>{p.icon} {p.title}</span><b>{inr(p.total)}</b></li>)}
          </ul>
        </section>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section className="card pad" aria-labelledby="next">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 id="next" style={{ fontSize: "1.2rem" }}>Next poojas</h2><Link href="/admin/bookings" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          {d.nextBookings.length === 0 ? <p className="muted" style={{ marginTop: "1rem" }}>No upcoming bookings yet.</p> : (
            <ul className="list-plain" style={{ marginTop: ".5rem" }}>
              {d.nextBookings.map((b) => (
                <li key={b.id}><span><b>{b.poojaTitle}</b><br /><small className="muted">{fmtISO(b.date)} at {fmtTime(b.slot)} · {b.name}</small></span><StatusBadge status={b.status} /></li>
              ))}
            </ul>
          )}
        </section>
        <section className="card pad" aria-labelledby="rec">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 id="rec" style={{ fontSize: "1.2rem" }}>Recent receipts</h2><Link href="/admin/receipts" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <ul className="list-plain" style={{ marginTop: ".5rem" }}>
            {d.recent.map((r) => (
              <li key={r.id}><span><b>{r.name}</b><br /><small className="muted">{r.title} · {fmtDate(r.createdAt)}</small></span><b>{inr(r.amount)}</b></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
