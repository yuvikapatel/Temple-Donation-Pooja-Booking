"use client";

// Global error boundary (client component, as required by Next.js)
export default function GlobalError({ error, reset }) {
  return (
    <main id="main" className="login-wrap">
      <div className="card login-card" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "1.8rem" }}>Something went wrong</h1>
        <p className="muted" style={{ margin: ".6rem 0 1.5rem" }}>{error?.message ? "An unexpected error occurred." : "Please try again."}</p>
        <button className="btn btn-dark" onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}
