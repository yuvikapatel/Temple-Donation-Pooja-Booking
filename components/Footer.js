import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer no-print">
      <div className="container footer-grid">
        <div>
          <div className="brand"><span className="brand-mark" aria-hidden="true">ॐ</span><span>{SITE.name}</span></div>
          <p>{SITE.address}</p>
          <p>{SITE.hours}</p>
        </div>
        <div>
          <h4>Explore</h4>
          {NAV.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </div>
        <div>
          <h4>Contact</h4>
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <Link href="/admin">Temple staff login</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.name} Trust</span>
        <span>Donations are recorded with a receipt number you can look up any time.</span>
      </div>
    </footer>
  );
}
