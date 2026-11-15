"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import { useToast } from "./Toast";
import { api } from "@/lib/client-api";
import { fmtDateTime, inr } from "@/lib/format";

const PAGE_SIZE = 8;

export default function ReceiptsTable({ initial }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState({ key: "createdAt", dir: "desc" });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = rows.filter(
      (r) => (type === "All" || r.type === type) && (status === "All" || r.status === status) &&
        (!term || `${r.id} ${r.name} ${r.title} ${r.phone}`.toLowerCase().includes(term))
    );
    const f = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => (typeof a[sort.key] === "number" ? a[sort.key] - b[sort.key] : String(a[sort.key]).localeCompare(String(b[sort.key]))) * f);
  }, [rows, q, type, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const total = filtered.reduce((s, r) => s + (r.status === "cancelled" ? 0 : r.amount), 0);

  const sortBy = (key) => { setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" })); setPage(1); };
  const arrow = (key) => (sort.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : "");
  const reset = (fn) => (e) => { fn(e.target.value); setPage(1); };

  async function remove(r) {
    if (!window.confirm(`Delete receipt ${r.id}? This cannot be undone.`)) return;
    try {
      await api(`/api/${r.type === "Donation" ? "donations" : "bookings"}/${r.id}`, { method: "DELETE" });
      setRows((list) => list.filter((x) => x.id !== r.id));
      toast("Receipt deleted.");
      router.refresh();
    } catch (err) { toast(err.message, "error"); }
  }

  // Export what is currently filtered as a CSV file
  function exportCsv() {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const head = ["Receipt", "Type", "Name", "Phone", "Email", "Item", "Amount", "Status", "Date"];
    const body = filtered.map((r) => [r.id, r.type, r.name, r.phone, r.email, r.title, r.amount, r.status, r.createdAt].map(esc).join(","));
    const url = URL.createObjectURL(new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "receipts.csv" });
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${filtered.length} receipts.`);
  }

  return (
    <>
      <div className="toolbar">
        <input type="search" placeholder="Search by name, receipt or item" aria-label="Search receipts" value={q} onChange={reset(setQ)} />
        <select aria-label="Type" value={type} onChange={reset(setType)}><option>All</option><option>Donation</option><option>Booking</option></select>
        <select aria-label="Status" value={status} onChange={reset(setStatus)}>
          {["All", "paid", "confirmed", "pending", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={exportCsv} disabled={!filtered.length}>Export CSV</button>
      </div>
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty"><h3>No receipts found</h3><p>Change the search or filters to see more.</p></div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th><button onClick={() => sortBy("id")}>Receipt{arrow("id")}</button></th>
                  <th><button onClick={() => sortBy("name")}>Devotee{arrow("name")}</button></th>
                  <th>For</th>
                  <th><button onClick={() => sortBy("amount")}>Amount{arrow("amount")}</button></th>
                  <th>Status</th>
                  <th><button onClick={() => sortBy("createdAt")}>Date{arrow("createdAt")}</button></th>
                  <th><span className="sr-only">Actions</span></th>
                </tr></thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id}>
                      <td><b>{r.id}</b><br /><small className="muted">{r.type}</small></td>
                      <td>{r.name}<br /><small className="muted">{r.phone}</small></td>
                      <td>{r.title}</td>
                      <td><b>{inr(r.amount)}</b></td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtDateTime(r.createdAt)}</td>
                      <td><div className="actions">
                        <Link className="btn btn-ghost btn-sm" href={`/receipt/${r.id}`} target="_blank">View</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(r)}>Delete</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pager">
              <span>{filtered.length} receipts · total {inr(total)}</span>
              <div>
                <button className="btn btn-ghost btn-sm" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button>
                <span style={{ alignSelf: "center" }}>Page {current} of {pages}</span>
                <button className="btn btn-ghost btn-sm" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
