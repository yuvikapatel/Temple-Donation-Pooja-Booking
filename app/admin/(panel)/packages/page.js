import PackageManager from "@/components/PackageManager";
import { getPackages } from "@/lib/queries";

export const metadata = { title: "Packages" };
export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  return <PackageManager initial={await getPackages({ activeOnly: false })} />;
}
