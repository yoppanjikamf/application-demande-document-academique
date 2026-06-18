"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";

export function NavBarGuestActions() {
  const { t } = useI18n();

  return (
    <Button asChild>
      <Link href="/auth/register">{t("common.activation")}</Link>
    </Button>
  );
}
