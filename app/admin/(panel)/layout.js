import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { isAdmin } from "@/lib/session";

export const metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }) {
  // Middleware already guards /admin; this is a second check in case the matcher is ever changed.
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="admin">
      <AdminSidebar />
      <main id="main" className="admin-main">{children}</main>
    </div>
  );
}
