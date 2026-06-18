"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function NavUserMenu({ homePath }: { homePath: string }) {
  const { t } = useI18n();

  return (
    <>
      <nav className="hidden items-center gap-2 sm:flex" aria-label={t("nav.accountNav")}>
        <LanguageSwitcher compact />
        <Button asChild variant="ghost">
          <Link href={homePath}>{t("common.mySpace")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/account">{t("common.account")}</Link>
        </Button>
        <form action="/logout" method="post">
          <Button type="submit" variant="outline">
            {t("common.logout")}
          </Button>
        </form>
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="sm:hidden"
            aria-label={t("common.openMenu")}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(100%,300px)]">
          <SheetHeader>
            <SheetTitle className="text-left font-display text-xl">{t("nav.myAccount")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
          <nav className="mt-6 flex flex-col gap-3" aria-label={t("nav.accountMobile")}>
            <SheetClose asChild>
              <Button asChild variant="ghost" className="justify-start">
                <Link href={homePath}>{t("common.mySpace")}</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/account">{t("common.account")}</Link>
              </Button>
            </SheetClose>
            <form action="/logout" method="post">
              <Button type="submit" variant="outline" className="w-full justify-start">
                {t("common.logout")}
              </Button>
            </form>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
