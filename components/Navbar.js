"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/site";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]); // close the mobile menu after navigating

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="nav no-print">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
          <span className="brand-mark" aria-hidden="true">ॐ</span>
          <span>{SITE.short}</span>
        </Link>
        <nav aria-label="Main" className={`nav-links ${open ? "open" : ""}`} id="main-nav">
          {NAV.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>{l.label}</Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link href="/admin" className="btn btn-primary btn-sm">Staff Login</Link>
          <button className="burger" aria-label="Menu" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen((o) => !o)}>
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
