"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import { api } from "@/lib/client-api";
import { fmtISO, fmtTime, inr } from "@/lib/format";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

// Agenda view: bookings grouped by pooja date
export default function BookingsManager({ initial, today }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [when, setWhen] = useState("upcoming");
  const [status, setStatus] = useState("All");

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = rows.filter(
      (b) => (when === "all" || (when === "upcoming" ? b.date >= today : b.date < today)) &&
        (status === "All" || b.status === status) &&
        (!term || `${b.name} ${b.poojaTitle} ${b.id} ${b.phone}`.toLowerCase().includes(term))
    ).sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot) * (when === "past" ? -1 : 1));
    const map = new Map();
    list.forEach((b) => map.set(b.date, [...(map.get(b.date) || []), b]));
    return [...map.entries()];
  }, [rows, q, when, status, today]);

  async function setStatusOf(b, next) {
    try {
      const { booking } = await api(`/api/bookings/${b.id}`, { method: "PATCH", body: { status: next } });
      setRows((list) => list.map((x) => (x.id === b.id ? booking : x)));
      toast(`Booking marked ${next}.`);
      router.refresh();
    } catch (err) { toast(err.message, "error"); }
  }

  async function remove(b) {
    if (!window.confirm(`Delete booking ${b.id}?`)) return;
    try {
      await api(`/api/bookings/${b.id}`, { method: "DELETE" });
      setRows((list) => list.filter((x) => x.id !== b.id));
      toast("Booking deleted.");
      router.refresh();
    } catch (err) { toast(err.message, "error"); }
  }

  return (
    <>
      <div className="admin-head"><div><h1 style={{ fontSize: "2rem" }}>Bookings</h1><p>Confirm, complete or cancel poojas. Cancelling frees the seat.</p></div></div>
      <div className="toolbar">
        <input type="search" placeholder="Search by name, pooja or receipt" aria-label="Search bookings" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="When" value={when} onChange={(e) => setWhen(e.target.value)}><option value="upcoming">Upcoming</option><option value="past">Past</option><option value="all">All dates</option></select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>{["All", ...STATUSES].map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="card">
        {groups.length === 0 ? <div className="empty"><h3>No bookings here</h3><p>Try another date range or status.</p></div> : groups.map(([date, list]) => (
          <section key={date} aria-label={fmtISO(date)}>
            <div className="date-group">{fmtISO(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{date === today && " (today)"}</div>
            <div className="table-wrap"><table><tbody>
              {list.map((b) => (
                <tr key={b.id}>
                  <td style={{ whiteSpace: "nowrap" }}><b>{fmtTime(b.slot)}</b></td>
                  <td><b>{b.poojaTitle}</b><br /><small className="muted">{b.id}</small></td>
                  <td>{b.name}<br /><small className="muted">{b.phone} · {b.devotees} {b.devotees === 1 ? "devotee" : "devotees"}{b.gotra ? ` · ${b.gotra}` : ""}</small></td>
                  <td>{inr(b.amount)}</td>
                  <td><select aria-label={`Status for ${b.id}`} value={b.status} onChange={(e) => setStatusOf(b, e.target.value)} style={{ width: "auto", padding: ".35rem .6rem" }}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                  <td><div className="actions"><button className="btn btn-danger btn-sm" onClick={() => remove(b)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody></table></div>
          </section>
        ))}
      </div>
    </>
  );
}
