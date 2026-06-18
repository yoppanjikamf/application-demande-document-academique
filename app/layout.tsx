import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import "./../styles/globals.css";

import { LocaleProvider } from "@/components/i18n/locale-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${body.className} ${body.variable} ${display.variable}`}>
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
