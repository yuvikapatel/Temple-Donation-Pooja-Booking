"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Field from "./Field";
import { useToast } from "./Toast";
import { api } from "@/lib/client-api";
import { inr } from "@/lib/format";
import { validatePackage } from "@/lib/validate";

const EMPTY = { title: "", description: "", category: "Seva", icon: "🪔", amount: "1001", allowCustom: false, min: "101", goal: "", active: true, featured: false };
const CATEGORIES = ["Annadanam", "Seva", "Festival", "Temple care", "Education"];

export default function PackageManager({ initial }) {
  const router = useRouter();
  const toast = useToast();
  const dialog = useRef(null);
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null); // package id, or null when creating
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function open(pkg) {
    setEditing(pkg?.id || null);
    setForm(pkg ? { ...EMPTY, ...pkg, amount: String(pkg.amount), min: String(pkg.min || 101), goal: pkg.goal ? String(pkg.goal) : "" } : EMPTY);
    setErrors({});
    dialog.current.showModal();
  }

  async function save(e) {
    e.preventDefault();
    const { errors: found } = validatePackage(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const url = editing ? `/api/packages/${editing}` : "/api/packages";
      const { package: saved } = await api(url, { method: editing ? "PUT" : "POST", body: form });
      setRows((list) => (editing ? list.map((p) => (p.id === editing ? { ...p, ...saved } : p)) : [...list, saved]));
      toast(editing ? "Package updated." : "Package created.");
      dialog.current.close();
      router.refresh();
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, "error");
    } finally { setBusy(false); }
  }

  async function remove(p) {
    if (!window.confirm(`Delete "${p.title}"? Existing receipts will keep working.`)) return;
    try {
      await api(`/api/packages/${p.id}`, { method: "DELETE" });
      setRows((list) => list.filter((x) => x.id !== p.id));
      toast("Package deleted.");
      router.refresh();
    } catch (err) { toast(err.message, "error"); }
  }

  async function toggle(p) {
    try {
      const { package: saved } = await api(`/api/packages/${p.id}`, { method: "PUT", body: { ...p, active: !p.active } });
      setRows((list) => list.map((x) => (x.id === p.id ? { ...x, ...saved } : x)));
      toast(saved.active ? "Package is now visible." : "Package hidden from the public site.");
      router.refresh();
    } catch (err) { toast(err.message, "error"); }
  }

  return (
    <>
      <div className="admin-head">
        <div><h1 style={{ fontSize: "2rem" }}>Donation packages</h1><p>Changes appear on the public site straight away.</p></div>
        <button className="btn btn-primary" onClick={() => open(null)}>Add package</button>
      </div>
      <div className="card">
        {rows.length === 0 ? <div className="empty"><h3>No packages yet</h3><p>Add your first package so devotees can donate.</p></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Package</th><th>Category</th><th>Suggested</th><th>Raised</th><th>Visibility</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{rows.map((p) => (
              <tr key={p.id}>
                <td><b>{p.icon} {p.title}</b>{p.featured && <> <span className="badge badge-warn">Featured</span></>}</td>
                <td>{p.category}</td>
                <td>{inr(p.amount)}</td>
                <td>{inr(p.raised || 0)}{p.goal ? <small className="muted"> / {inr(p.goal)}</small> : null}</td>
                <td><button className={`badge ${p.active ? "badge-ok" : ""}`} style={{ border: 0, cursor: "pointer" }} onClick={() => toggle(p)} aria-label={`${p.active ? "Hide" : "Show"} ${p.title}`}>{p.active ? "Visible" : "Hidden"}</button></td>
                <td><div className="actions"><button className="btn btn-ghost btn-sm" onClick={() => open(p)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => remove(p)}>Delete</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      <dialog ref={dialog} className="modal" aria-labelledby="pkg-title">
        <form onSubmit={save} noValidate>
          <h2 id="pkg-title" style={{ fontSize: "1.5rem", marginBottom: "1.25rem" }}>{editing ? "Edit package" : "Add package"}</h2>
          <div className="row">
            <Field id="p-title" label="Title" error={errors.title}><input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field id="p-icon" label="Icon (emoji)" error={errors.icon}><input value={form.icon} maxLength={4} onChange={(e) => set("icon", e.target.value)} /></Field>
          </div>
          <Field id="p-desc" label="Description" error={errors.description}><textarea value={form.description} maxLength={300} onChange={(e) => set("description", e.target.value)} /></Field>
          <div className="row">
            <Field id="p-cat" label="Category" error={errors.category}>
              <input list="cats" value={form.category} onChange={(e) => set("category", e.target.value)} />
            </Field>
            <Field id="p-amt" label="Suggested amount (₹)" error={errors.amount}><input type="number" min="1" value={form.amount} onChange={(e) => set("amount", e.target.value)} /></Field>
          </div>
          <datalist id="cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
          <div className="row">
            <Field id="p-goal" label="Funding goal (₹, optional)" error={errors.goal} hint="Shows a progress bar."><input type="number" min="0" value={form.goal} onChange={(e) => set("goal", e.target.value)} /></Field>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /><span>Visible on the site</span></label>
            <label className="check"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /><span>Feature on the home page</span></label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => dialog.current.close()}>Cancel</button>
            <button className="btn btn-primary" disabled={busy}>{busy ? <><span className="spinner" /> Saving</> : "Save package"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
