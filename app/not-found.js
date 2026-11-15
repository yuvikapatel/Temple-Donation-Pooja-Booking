import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="login-wrap">
      <div className="card login-card" style={{ textAlign: "center" }}>
        <div className="icon-tile" style={{ margin: "0 auto 1rem" }}>🪔</div>
        <h1 style={{ fontSize: "2rem" }}>We can't find that page</h1>
        <p className="muted" style={{ margin: ".6rem 0 1.5rem" }}>The link may be old, or the receipt number may be mistyped.</p>
        <Link href="/" className="btn btn-primary">Back to home</Link>
      </div>
    </main>
  );
}
