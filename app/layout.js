import { Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { SITE } from "@/lib/site";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | Donations and pooja bookings`, template: `%s | ${SITE.name}` },
  description: "Donate to annadanam, festivals and temple care, book poojas on a calendar, and get an instant receipt.",
  openGraph: { title: SITE.name, description: SITE.tagline, type: "website", siteName: SITE.name },
  robots: { index: true, follow: true },
};

export const viewport = { themeColor: "#1d1a3b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
