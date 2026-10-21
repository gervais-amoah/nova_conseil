import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const font = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const viewport: Viewport = { colorScheme: "light" };
export const metadata: Metadata = {
  title: "Novae Conseil — Pragmatic consulting for lasting impact",
  description:
    "Novae Conseil helps SMEs and mid-sized companies turn change into measurable results.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
