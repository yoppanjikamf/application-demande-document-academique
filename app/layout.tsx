import type { Metadata } from "next";
import localFont from "next/font/local";
import "./../styles/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const satoshi = localFont({
  src: "../nextjs-admin-dashboard-main/src/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DR-DOCSCOL",
    template: "%s | DR-DOCSCOL",
  },
  description: "Gestion des demandes et retraits de documents scolaires.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={satoshi.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
