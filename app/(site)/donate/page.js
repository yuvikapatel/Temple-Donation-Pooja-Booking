import PackageBrowser from "@/components/PackageBrowser";
import { getPackages } from "@/lib/queries";

export const metadata = {
  title: "Donate",
  description: "Choose an annadanam, seva, festival or temple-care package and donate with an instant receipt.",
};
export const revalidate = 60; // ISR

export default async function DonatePage() {
  const packages = await getPackages();
  return (
    <>
      <section className="page-head">
        <div className="container">
          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Donation packages</h1>
          <p>Every package funds a specific seva. Give any amount you wish; the suggested amount is only a guide.</p>
        </div>
      </section>
      <section className="container" style={{ paddingBottom: "2rem" }}>
        <PackageBrowser packages={packages} />
      </section>
    </>
  );
}
