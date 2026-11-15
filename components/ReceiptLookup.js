"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReceiptLookup() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const clean = id.trim().toUpperCase();
    if (!/^(DN|BK)-\d{8}-[A-Z0-9]{6}$/.test(clean)) return setError("Receipt numbers look like DN-20261115-K7QX3M or BK-20261115-K7QX3M.");
    router.push(`/receipt/${clean}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card pad" style={{ maxWidth: 520 }}>
      <div className="field">
        <label htmlFor="rid">Receipt number</label>
        <input id="rid" value={id} onChange={(e) => { setId(e.target.value); setError(""); }} placeholder="DN-20261115-K7QX3M" aria-invalid={error ? "true" : undefined} aria-describedby={error ? "rid-err" : undefined} autoComplete="off" />
        {error && <span id="rid-err" className="err" role="alert">{error}</span>}
      </div>
      <button className="btn btn-dark">Find receipt</button>
    </form>
  );
}
