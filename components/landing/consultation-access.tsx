import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ConsultationAccessSection({ consultationUrl }: { consultationUrl: string }) {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(consultationUrl)}`;

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
            Vérifiez la disponibilité de vos documents avec votre matricule
          </h2>
          <p className="mt-4 text-base leading-7 text-text-3">
            Scannez le QR code ou ouvrez la page de consultation : saisissez votre matricule pour
            voir si vos documents sont disponibles, en attente ou déjà retirés. Aucun compte n&apos;est
            créé automatiquement.
          </p>
          <p className="mt-3 text-sm leading-6 text-text-3">
            Pour une demande, un paiement ou un rendez-vous de retrait, activez votre compte ou
            connectez-vous ensuite.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/consultation">
              Ouvrir la consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-token)] bg-surface-1 p-6 shadow-card sm:p-8">
          <img
            src={qrImageUrl}
            alt="QR code vers la consultation rapide DR-DOCSCOL"
            width={220}
            height={220}
            className="rounded-lg border border-[var(--border-token)] bg-white p-3"
          />
          <p className="mt-4 text-center text-sm leading-6 text-text-3">
            Scannez pour connaître le statut de vos documents académiques.
          </p>
        </div>
      </div>
    </section>
  );
}
