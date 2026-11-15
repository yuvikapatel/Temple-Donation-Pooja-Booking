import BookingForm from "@/components/BookingForm";
import { getPoojas } from "@/lib/queries";
import { todayIST } from "@/lib/format";

export const metadata = {
  title: "Book a pooja",
  description: "Pick a pooja, choose a date on the calendar and reserve a time slot with live seat availability.",
};
// Dynamic rendering: "today" and seat counts must never be cached.
export const dynamic = "force-dynamic";

export default async function BookingPage({ searchParams }) {
  const poojas = await getPoojas();
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Book a pooja</h1>
          <p>Choose the pooja, pick a date, then a time with seats left. Bookings open 90 days ahead.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: "2rem" }}>
        <BookingForm poojas={poojas} today={todayIST()} initialPooja={searchParams?.pooja} />
      </section>
    </>
  );
}
