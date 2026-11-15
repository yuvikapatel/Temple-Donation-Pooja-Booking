import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Shared chrome for every public page. Admin pages use their own layout.
export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
