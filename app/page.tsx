import Link from "next/link";
import { ArrowRight, CalendarCheck, FileCheck2, GraduationCap, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_52%,#ffffff_100%)]" />
          <div className="absolute right-0 top-16 hidden h-[520px] w-[520px] rounded-full border border-blue-100 bg-blue-50/60 lg:block" />
          <div className="absolute right-24 top-40 hidden h-64 w-80 rotate-3 rounded-md border border-slate-200 bg-white p-6 shadow-2xl lg:block">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-blue-700">Dossier OBC</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">Baccalaureat</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-700" />
            </div>
            <div className="mt-5 space-y-3">
              <div className="h-3 w-52 rounded-full bg-slate-200" />
              <div className="h-3 w-40 rounded-full bg-slate-200" />
              <div className="mt-6 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Document disponible
              </div>
            </div>
          </div>
          <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-blue-700">Office du Baccalaureat du Cameroun</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Retraits de documents academiques
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Consultez la disponibilite de vos diplomes, releves et duplicatas, planifiez votre rendez-vous
                et suivez chaque retrait dans un espace securise.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/login">
                    Acceder a mon espace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/register">Activer mon compte</Link>
                </Button>
              </div>
            </div>

            <div className="mt-16 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: FileCheck2,
                  title: "Statuts centralises",
                  text: "Disponibilite, centre de retrait et historique du document.",
                },
                {
                  icon: CalendarCheck,
                  title: "Rendez-vous maitrises",
                  text: "Creneaux controles par quota journalier et suivi par le service OBC.",
                },
                {
                  icon: ShieldCheck,
                  title: "Acces par role",
                  text: "Espace eleve et back-office administration separes.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                  <item.icon className="h-5 w-5 text-blue-700" />
                  <h2 className="mt-4 font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
