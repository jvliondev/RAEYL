import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "RAEYL",
    template: "%s | RAEYL"
  },
  description: siteConfig.description
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-background text-foreground")}>
        {children}
      </body>
    </html>
  );
}
