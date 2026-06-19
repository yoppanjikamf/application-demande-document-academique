"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowRight, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveConsultationQrUrl } from "@/lib/site-url";

export function ConsultationAccessSection({ consultationUrl }: { consultationUrl: string }) {
  const [effectiveUrl, setEffectiveUrl] = useState(consultationUrl);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    setEffectiveUrl(resolveConsultationQrUrl(consultationUrl));
  }, [consultationUrl]);

  useEffect(() => {
    let cancelled = false;

    async function generateQr() {
      setQrError(false);
      setQrDataUrl(null);

      try {
        const dataUrl = await QRCode.toDataURL(effectiveUrl, {
          width: 220,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#0f172a", light: "#ffffff" },
        });

        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setQrError(true);
        }
      }
    }

    void generateQr();

    return () => {
      cancelled = true;
    };
  }, [effectiveUrl]);

  return (
    <section
      id="consultation"
      className="border-y border-[var(--border-token)] bg-surface-0 py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-obc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-obc-800">
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Consultation rapide
          </p>
          <h2 className="mt-4 font-display text-3xl text-text-1 sm:text-4xl">
            Consultez vos documents après activation de compte
          </h2>
          <p className="mt-4 text-base leading-7 text-text-3">
            Cette consultation rapide est réservée aux élèves ayant déjà activé leur compte
            DR-DOCSCOL. Saisissez votre matricule pour voir si vos documents sont disponibles, en
            attente ou déjà retirés.
          </p>
          <p className="mt-3 text-sm leading-6 text-text-3">
            Si votre compte n&apos;est pas encore activé, commencez par l&apos;activation avec votre
            matricule et votre e-mail enregistrés par l&apos;administration.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/consultation">
              Ouvrir la consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-token)] bg-surface-1 p-6 shadow-card sm:p-8">
          <div className="flex h-[220px] w-[220px] items-center justify-center rounded-lg border border-[var(--border-token)] bg-white p-3">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="QR code vers la consultation rapide DR-DOCSCOL"
                width={220}
                height={220}
                className="h-full w-full"
              />
            ) : qrError ? (
              <p className="px-2 text-center text-xs leading-5 text-text-3">
                QR code indisponible. Utilisez le bouton « Ouvrir la consultation ».
              </p>
            ) : (
              <p className="text-xs text-text-muted">Chargement du QR code…</p>
            )}
          </div>
          <p className="mt-4 max-w-xs text-center text-sm leading-6 text-text-3">
            Scannez ce QR code avec votre téléphone pour consulter le statut de vos documents
            scolaires avec votre matricule, après activation de votre compte.
          </p>
        </div>
      </div>
    </section>
  );
}
