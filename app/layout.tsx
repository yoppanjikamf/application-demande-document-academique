import type { Metadata } from "next";
import localFont from "next/font/local";
import "./../styles/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

const satoshi = localFont({
  src: "../nextjs-admin-dashboard-main/src/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OBC Documents Academiques",
    template: "%s | OBC Documents Academiques",
  },
  description: "Gestion des demandes et retraits de documents academiques OBC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={satoshi.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SiteHeader />
          <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
