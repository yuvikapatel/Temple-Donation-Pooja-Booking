import ReceiptLookup from "@/components/ReceiptLookup";

export const metadata = { title: "Find your receipt", description: "Look up a donation or pooja booking receipt by its receipt number." };

export default function ReceiptSearchPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Find your receipt</h1>
          <p>Enter the receipt number shown after your donation or booking. It starts with DN for donations and BK for bookings.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: "2rem" }}><ReceiptLookup /></section>
    </>
  );
}
