import Link from "next/link";
import { inr } from "@/lib/format";

export default function PackageCard({ pkg }) {
  const pct = pkg.goal ? Math.min(100, Math.round((pkg.raised / pkg.goal) * 100)) : null;
  return (
    <Link href={`/donate/${pkg.id}`} className="card pkg" aria-label={`${pkg.title}, give any amount`}>
      <div className="pkg-top">
        <span className="icon-tile" aria-hidden="true">{pkg.icon}</span>
        <span className="badge">{pkg.category}</span>
      </div>
      <h3>{pkg.title}</h3>
      <p>{pkg.description}</p>
      {pct !== null && (
        <div>
          <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Funding progress"><span style={{ width: `${pct}%` }} /></div>
          <small className="muted">{inr(pkg.raised)} of {inr(pkg.goal)} ({pct}%)</small>
        </div>
      )}
      <div className="pkg-foot">
        <span className="price">Any amount<small> · suggested {inr(pkg.amount)}</small></span>
        <span className="btn btn-dark btn-sm">Donate</span>
      </div>
    </Link>
  );
}
