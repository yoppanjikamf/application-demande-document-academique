import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./../styles/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const display = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DR-DOCSCOL",
    template: "%s | DR-DOCSCOL",
  },
  description:
    "Demandez, suivez et retirez vos documents scolaires en ligne — portail OBC/DECC pour élèves, administrations et centres d'examen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${body.className} ${body.variable} ${display.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
