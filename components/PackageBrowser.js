"use client";
import { useMemo, useState } from "react";
import PackageCard from "./PackageCard";

// Client-side search / filter / sort over the (small) list the server already rendered.
export default function PackageBrowser({ packages }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const categories = ["All", ...new Set(packages.map((p) => p.category))];

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const rows = packages.filter(
      (p) => (category === "All" || p.category === category) && (!term || `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(term))
    );
    const price = (p) => p.amount;
    const sorters = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title),
      low: (a, b) => price(a) - price(b),
      high: (a, b) => price(b) - price(a),
      name: (a, b) => a.title.localeCompare(b.title),
    };
    return [...rows].sort(sorters[sort]);
  }, [packages, q, category, sort]);

  return (
    <>
      <div className="toolbar">
        <input type="search" placeholder="Search packages" aria-label="Search packages" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured first</option>
          <option value="low">Suggested amount: low to high</option>
          <option value="high">Suggested amount: high to low</option>
          <option value="name">Name</option>
        </select>
      </div>
      {shown.length === 0 ? (
        <div className="card empty">
          <h3>No packages match</h3>
          <p>Try a different word or clear the category filter.</p>
          <button className="btn btn-ghost" style={{ marginTop: "1rem" }} onClick={() => { setQ(""); setCategory("All"); }}>Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-3">{shown.map((p) => <PackageCard key={p.id} pkg={p} />)}</div>
      )}
    </>
  );
}
