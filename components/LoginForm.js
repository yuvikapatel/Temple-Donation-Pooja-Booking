"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Field from "./Field";
import { api } from "@/lib/client-api";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Enter your email and password.");
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/login", { method: "POST", body: form });
      const next = params.get("next");
      // Only allow redirects back into /admin (prevents open-redirect abuse)
      router.replace(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {error && <div className="form-error" role="alert">{error}</div>}
      <Field id="email" label="Email"><input type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field id="password" label="Password"><input type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? <><span className="spinner" /> Signing in</> : "Sign in"}</button>
    </form>
  );
}
