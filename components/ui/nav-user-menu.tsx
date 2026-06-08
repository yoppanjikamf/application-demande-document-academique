"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

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
  return (
    <>
      <nav className="hidden items-center gap-2 sm:flex" aria-label="Navigation du compte">
        <Button asChild variant="ghost">
          <Link href={homePath}>Mon espace</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/account">Compte</Link>
        </Button>
        <form action="/logout" method="post">
          <Button type="submit" variant="outline">
            Déconnexion
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
            aria-label="Ouvrir le menu du compte"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(100%,300px)]">
          <SheetHeader>
            <SheetTitle className="text-left font-display text-xl">Mon compte</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-3" aria-label="Navigation du compte (mobile)">
            <SheetClose asChild>
              <Button asChild className="w-full justify-start">
                <Link href={homePath}>Mon espace</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/account">Compte</Link>
              </Button>
            </SheetClose>
            <form action="/logout" method="post" className="mt-2">
              <Button type="submit" variant="outline" className="w-full justify-start">
                Déconnexion
              </Button>
            </form>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
