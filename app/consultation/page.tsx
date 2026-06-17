import Link from "next/link";

import { ConsultationPanel } from "@/components/consultation/consultation-panel";
import { DocScolLogo } from "@/components/ui/DocScolLogo";

export const metadata = {
  title: "Consultation rapide",
  description:
    "Consultez la disponibilité de vos documents scolaires avec votre matricule, sans connexion.",
};

export default function ConsultationPage() {
  return (
    <div className="min-h-dvh bg-surface-1 text-text-1">
      <header className="border-b border-[var(--border-token)] bg-surface-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/">
            <DocScolLogo variant="full" theme="light" />
          </Link>
          <Link href="/" className="text-sm font-medium text-obc-700 hover:text-obc-900">
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <ConsultationPanel />
      </main>
    </div>
  );
}
