import BookingsManager from "@/components/BookingsManager";
import { readDb } from "@/lib/db";
import { todayIST } from "@/lib/format";

export const metadata = { title: "Bookings" };
export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const db = await readDb();
  return <BookingsManager initial={db.bookings} today={todayIST()} />;
}
