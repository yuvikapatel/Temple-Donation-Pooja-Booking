import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { SITE } from "@/lib/site";

export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main id="main" className="login-wrap">
      <div className="card login-card">
        <div className="brand" style={{ marginBottom: "1.25rem" }}><span className="brand-mark" aria-hidden="true">ॐ</span><span>{SITE.short} admin</span></div>
        <h1 style={{ fontSize: "1.7rem", marginBottom: ".4rem" }}>Sign in</h1>
        <p className="muted" style={{ marginBottom: "1.5rem", fontSize: ".92rem" }}>For temple staff only.</p>
        {/* useSearchParams needs a Suspense boundary during static rendering */}
        <Suspense fallback={<div className="skel" style={{ height: 180 }} />}><LoginForm /></Suspense>
        <p style={{ marginTop: "1.25rem", fontSize: ".88rem" }}><Link href="/">Back to the public site</Link></p>
      </div>
    </main>
  );
}
