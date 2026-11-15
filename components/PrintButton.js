"use client";

export default function PrintButton() {
  return <button className="btn btn-dark" onClick={() => window.print()}>Print or save as PDF</button>;
}
