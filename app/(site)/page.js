import Link from "next/link";
import PackageCard from "@/components/PackageCard";
import { getPackages, getPoojas } from "@/lib/queries";
import { readDb } from "@/lib/db";
import { fmtTime, inr } from "@/lib/format";
import { SITE } from "@/lib/site";

// ISR: the page is pre-rendered and refreshed in the background at most once a minute.
// Admin changes to packages also call revalidatePath("/") for instant updates.
export const revalidate = 60;

const QUOTES = [
  { text: "We booked the Satyanarayana Katha for our new home in two minutes, and the receipt was in my inbox before we left the page.", who: "Kavita Iyer, devotee" },
  { text: "Sponsoring annadanam for my father's memorial was simple, and I could print the receipt for the family.", who: "Rohan Mehta, donor" },
  { text: "The slot calendar shows how many seats are left, so we never turn up to a full hall.", who: "Harpreet Kaur, regular visitor" },
];

export default async function HomePage() {
  const [packages, poojas, db] = await Promise.all([getPackages(), getPoojas(), readDb()]);
  const featured = packages.filter((p) => p.featured).slice(0, 3);
  const raised = db.donations.reduce((s, d) => s + d.amount, 0);
  // Earliest slots across all poojas, shown as the temple's daily schedule
  const schedule = poojas.flatMap((p) => p.slots.map((t) => ({ t, title: p.title }))).sort((a, b) => a.t.localeCompare(b.t)).slice(0, 5);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Light a lamp for someone you love</h1>
            <p className="lead">Donate to annadanam, festivals and temple care, or book a pooja on the day that matters to your family. Every offering comes with a receipt you can print.</p>
            <div className="hero-cta">
              <Link href="/donate" className="btn btn-primary">Choose a donation</Link>
              <Link href="/booking" className="btn btn-light">Book a pooja</Link>
            </div>
          </div>
          <div className="hero-art">
            <div className="diya" aria-hidden="true"><span className="flame" /><span className="bowl" /></div>
            <div className="today-card">
              <h3>Daily pooja timings</h3>
              <ul>{schedule.map((s) => <li key={s.t + s.title}><span>{s.title}</span><span>{fmtTime(s.t)}</span></li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="container stats-inner">
          <div className="stat"><b>{inr(raised)}</b><span>given by devotees</span></div>
          <div className="stat"><b>{db.donations.length}</b><span>donations received</span></div>
          <div className="stat"><b>{db.bookings.length}</b><span>poojas booked</span></div>
          <div className="stat"><b>{poojas.length}</b><span>poojas you can book online</span></div>
        </div>
      </div>

      <section className="section container">
        <div className="section-head">
          <div><h2>Where your gift goes</h2><p>Each package funds a specific seva. You can see how much a fund has raised before you give.</p></div>
          <Link href="/donate" className="btn btn-ghost">See all packages</Link>
        </div>
        <div className="grid grid-3">{featured.map((p) => <PackageCard key={p.id} pkg={p} />)}</div>
      </section>

      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="section-head"><div><h2>How it works</h2></div></div>
        <ol className="steps">
          <li><h3>Choose</h3><p>Pick a donation package or a pooja that fits the occasion.</p></li>
          <li><h3>Confirm your details</h3><p>Add your name and contact. For poojas, select a date and a time with seats left.</p></li>
          <li><h3>Keep your receipt</h3><p>You get a receipt number straight away. Look it up or print it whenever you need.</p></li>
        </ol>
      </section>

      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div><h2>Poojas you can book</h2><p>Each pooja has fixed timings and limited seats, so pick your slot early for festival days.</p></div>
          <Link href="/booking" className="btn btn-ghost">Open booking calendar</Link>
        </div>
        <div className="grid grid-3">
          {poojas.slice(0, 3).map((p) => (
            <Link key={p.id} href={`/booking?pooja=${p.id}`} className="card pkg">
              <div className="pkg-top"><span className="icon-tile" aria-hidden="true">{p.icon}</span><span className="badge">{p.duration} min</span></div>
              <h3>{p.title}</h3><p>{p.description}</p>
              <div className="pkg-foot"><span className="price">{inr(p.price)}</span><span className="btn btn-dark btn-sm">Book</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="section-head"><div><h2>From our devotees</h2></div></div>
        <div className="grid grid-3">
          {QUOTES.map((q) => (
            <figure key={q.who} className="card quote" style={{ margin: 0 }}>
              <blockquote style={{ margin: 0 }}><p>{q.text}</p></blockquote>
              <footer>{q.who}</footer>
            </figure>
          ))}
        </div>
      </section>

      <section className="container" style={{ marginTop: "1rem" }}>
        <div className="cta-band">
          <div><h2>Visit us, or give from home</h2><p>{SITE.hours}. {SITE.address}.</p></div>
          <Link href="/donate" className="btn btn-primary">Make a donation</Link>
        </div>
      </section>
    </>
  );
}
