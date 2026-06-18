import type { Translator } from "@/lib/i18n/translate";
import { Building2, GraduationCap, MapPin, ShieldCheck } from "lucide-react";

export function getLoginPortals(t: Translator) {
  return [
    {
      href: "/auth/login",
      label: t("loginPortals.student"),
      hint: t("loginPortals.studentHint"),
      icon: GraduationCap,
    },
    {
      href: "/auth/login/obc",
      label: t("loginPortals.obc"),
      hint: t("loginPortals.obcHint"),
      icon: ShieldCheck,
    },
    {
      href: "/auth/login/decc",
      label: t("loginPortals.decc"),
      hint: t("loginPortals.deccHint"),
      icon: Building2,
    },
    {
      href: "/auth/login/centre-examen",
      label: t("loginPortals.agent"),
      hint: t("loginPortals.agentHint"),
      icon: MapPin,
    },
  ] as const;
}
