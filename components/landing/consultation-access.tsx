"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";

import { useI18n } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { isLocalhostUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

export function ConsultationAccessSection({ consultationUrl }: { consultationUrl: string }) {
  const { t } = useI18n();
  const [effectiveUrl, setEffectiveUrl] = useState(consultationUrl);

  useEffect(() => {
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    if (configuredSiteUrl) {
      setEffectiveUrl(`${configuredSiteUrl}/consultation`);
      return;
    }

    const devLanUrl = process.env.NEXT_PUBLIC_DEV_LAN_URL?.replace(/\/$/, "");
    if (devLanUrl) {
      setEffectiveUrl(`${devLanUrl}/consultation`);
      return;
    }

    const { hostname, origin } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      setEffectiveUrl(`${origin}/consultation`);
    }
  }, [consultationUrl]);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(effectiveUrl)}`;
  const localhostQr = isLocalhostUrl(effectiveUrl);

  return (
    <section
      id="consultation"
      className="border-y border-[var(--border-token)] bg-surface-0 py-14 lg:py-16"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-obc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-obc-800">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            {t("consultation.sectionBadge")}
          </p>
          <h2 className="mt-4 font-display text-3xl text-text-1 sm:text-4xl">
            {t("consultation.sectionTitle")}
          </h2>
          <p className="mt-4 text-base leading-7 text-text-3">{t("consultation.sectionDescription")}</p>
          <p className="mt-3 text-sm leading-6 text-text-3">{t("consultation.sectionFollowUp")}</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/consultation">
              {t("consultation.openButton")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-token)] bg-surface-1 p-6 shadow-card sm:p-8">
          <img
            src={qrImageUrl}
            alt={t("consultation.qrAlt")}
            width={220}
            height={220}
            className="rounded-lg border border-[var(--border-token)] bg-white p-3"
          />
          <p className="mt-4 text-center text-sm leading-6 text-text-3">{t("consultation.qrCaption")}</p>
          {localhostQr ? (
            <p
              className={cn(
                "mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs leading-5 text-amber-900",
              )}
            >
              {t("consultation.qrDevWarning")}
            </p>
          ) : null}
          <p className="mt-2 break-all text-center text-[11px] text-text-muted">{effectiveUrl}</p>
        </div>
      </div>
    </section>
  );
}
