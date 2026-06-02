import type { ReactNode } from "react";
import Link from "next/link";
import { Award, ShieldCheck } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#F8F9FA] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-[#1B4332] px-10 py-8 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            OD
          </span>
          <span>
            <span className="block text-lg font-bold">OBC/DECC</span>
            <span className="block text-xs text-white/70">Retraits académiques</span>
          </span>
        </Link>

        <div>
          <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl border border-white/20 bg-white/10">
            <Award className="h-14 w-14 text-[#B7E4C7]" aria-hidden="true" />
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight">
            Service numérique de gestion des documents académiques.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
            Un espace sécurisé pour les élèves, les administrations OBC/DECC et les agents des
            centres d&apos;examen au Cameroun.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/80">
          <ShieldCheck className="h-5 w-5 text-[#B7E4C7]" aria-hidden="true" />
          Accès réservé aux utilisateurs autorisés.
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <Link href="/" className="mb-8 flex items-center gap-3 text-[#1B4332] lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4332] text-white">
              OD
            </span>
            <span className="font-bold">OBC/DECC</span>
          </Link>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#52B788]">
              Portail sécurisé
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#111827]">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
