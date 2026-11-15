export default function Loading() {
  return (
    <div className="container section" aria-busy="true" aria-label="Loading">
      <div className="skel" style={{ height: 44, width: "40%", marginBottom: 24 }} />
      <div className="grid grid-3">
        {[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 220 }} />)}
      </div>
    </div>
  );
}
