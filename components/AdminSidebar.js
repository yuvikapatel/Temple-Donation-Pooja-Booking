"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/receipts", label: "Receipts", icon: "🧾" },
  { href: "/admin/bookings", label: "Bookings", icon: "📅" },
  { href: "/admin/packages", label: "Packages", icon: "🪔" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="sidebar">
      <Link href="/admin" className="brand"><span className="brand-mark" aria-hidden="true">ॐ</span><span>{SITE.short}</span></Link>
      <nav className="side-links" aria-label="Admin">
        {LINKS.map((l) => <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}><span aria-hidden="true">{l.icon}</span>{l.label}</Link>)}
        <Link href="/" style={{ marginTop: "auto" }}><span aria-hidden="true">🌐</span>View site</Link>
        <button onClick={logout}><span aria-hidden="true">🚪</span>Sign out</button>
      </nav>
    </aside>
  );
}
