import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";

import "@/app/globals.css";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "RAEYL — Website Ownership Wallet",
    template: "%s | RAEYL"
  },
  description: siteConfig.description
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(inter.variable, syne.variable)}>
      <body className={cn(inter.className, "min-h-screen bg-background text-foreground")}>
        {children}
      </body>
    </html>
  );
}
