const TONE = { paid: "badge-ok", confirmed: "badge-ok", completed: "badge-ok", pending: "badge-warn", cancelled: "badge-bad", refunded: "badge-bad" };

export default function StatusBadge({ status }) {
  return <span className={`badge ${TONE[status] || ""}`}>{status}</span>;
}
