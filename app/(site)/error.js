"use client";

export default function SiteError({ reset }) {
  return (
    <div className="container section">
      <div className="card empty">
        <h3>We couldn't load this page</h3>
        <p>Please check your connection and try again.</p>
        <button className="btn btn-dark" style={{ marginTop: "1rem" }} onClick={() => reset()}>Try again</button>
      </div>
    </div>
  );
}
