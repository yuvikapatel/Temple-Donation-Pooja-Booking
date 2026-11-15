export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skel" style={{ height: 40, width: 260, marginBottom: 24 }} />
      <div className="kpis">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 96 }} />)}</div>
      <div className="skel" style={{ height: 280 }} />
    </div>
  );
}
