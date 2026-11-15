"use client";
import { useState } from "react";

const pad = (n) => String(n).padStart(2, "0");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Accessible month calendar. Dates are plain "YYYY-MM-DD" strings, so there are no timezone surprises. */
export default function Calendar({ value, onChange, min, max }) {
  const start = value || min;
  const [view, setView] = useState({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 });
  const first = new Date(view.y, view.m, 1).getDay();
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const iso = (d) => `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
  const monthKey = (y, m) => `${y}-${pad(m + 1)}`;
  const canPrev = monthKey(view.y, view.m) > min.slice(0, 7);
  const canNext = monthKey(view.y, view.m) < max.slice(0, 7);
  const go = (delta) => setView(({ y, m }) => { const d = new Date(y, m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" onClick={() => go(-1)} disabled={!canPrev} aria-label="Previous month">‹</button>
        <span aria-live="polite">{MONTHS[view.m]} {view.y}</span>
        <button type="button" onClick={() => go(1)} disabled={!canNext} aria-label="Next month">›</button>
      </div>
      <div className="cal-grid" role="grid" aria-label="Choose a date">
        {DAYS.map((d) => <div key={d} className="cal-dow" aria-hidden="true">{d}</div>)}
        {cells.map((d, i) =>
          d === null ? <div key={`e${i}`} /> : (
            <button
              type="button" key={d}
              className={`cal-day ${iso(d) === value ? "sel" : ""} ${iso(d) === min ? "today" : ""}`}
              disabled={iso(d) < min || iso(d) > max}
              aria-pressed={iso(d) === value}
              aria-label={new Date(view.y, view.m, d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              onClick={() => onChange(iso(d))}
            >{d}</button>
          )
        )}
      </div>
    </div>
  );
}
