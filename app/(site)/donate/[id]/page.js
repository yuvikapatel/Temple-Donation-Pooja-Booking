import Link from "next/link";
import { notFound } from "next/navigation";
import DonationForm from "@/components/DonationForm";
import { getPackage, getPackages } from "@/lib/queries";
import { inr } from "@/lib/format";

export const revalidate = 60; // ISR for each package page

// Pre-build the pages we know about; new packages are generated on first visit (dynamicParams default = true).
export async function generateStaticParams() {
  return (await getPackages()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const pkg = await getPackage(params.id);
  if (!pkg) return { title: "Package not found" };
  return { title: `Donate: ${pkg.title}`, description: pkg.description };
}

export default async function PackagePage({ params }) {
  const pkg = await getPackage(params.id);
  if (!pkg || !pkg.active) notFound();
  const pct = pkg.goal ? Math.min(100, Math.round((pkg.raised / pkg.goal) * 100)) : null;

  return (
    <>
      <section className="page-head">
        <div className="container">
          <div className="crumbs"><Link href="/donate">Donate</Link> / {pkg.title}</div>
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{pkg.icon} {pkg.title}</h1>
          <p>{pkg.description}</p>
        </div>
      </section>
      <section className="container two-col" style={{ paddingBottom: "2rem" }}>
        <div className="card pad">
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>Your details</h2>
          <DonationForm pkg={{ id: pkg.id, title: pkg.title, amount: pkg.amount, }} />
        </div>
        <aside className="card pad sticky">
          <h3 style={{ marginBottom: ".75rem" }}>About this seva</h3>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem 1rem", fontSize: ".93rem" }}>
            <dt className="muted">Category</dt><dd style={{ margin: 0, textAlign: "right", fontWeight: 600 }}>{pkg.category}</dd>
            <dt className="muted">Suggested amount</dt><dd style={{ margin: 0, textAlign: "right", fontWeight: 600 }}>{inr(pkg.amount)}</dd>
            <dt className="muted">Donors so far</dt><dd style={{ margin: 0, textAlign: "right", fontWeight: 600 }}>{pkg.donors}</dd>
          </dl>
          {pct !== null && (
            <div style={{ marginTop: "1.25rem" }}>
              <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Funding progress"><span style={{ width: `${pct}%` }} /></div>
              <p className="muted" style={{ fontSize: ".88rem", marginTop: ".4rem" }}>{inr(pkg.raised)} raised of {inr(pkg.goal)} goal</p>
            </div>
          )}
          <p className="muted" style={{ fontSize: ".85rem", marginTop: "1.25rem" }}>You will get a receipt number immediately. Keep it to look up or print the receipt later.</p>
        </aside>
      </section>
    </>
  );
}
