import ReceiptsTable from "@/components/ReceiptsTable";
import { getReceipts } from "@/lib/queries";

export const metadata = { title: "Receipts" };
export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const rows = await getReceipts();
  return (
    <>
      <div className="admin-head"><div><h1 style={{ fontSize: "2rem" }}>Receipts</h1><p>Every donation and pooja booking in one place.</p></div></div>
      <ReceiptsTable initial={rows} />
    </>
  );
}
