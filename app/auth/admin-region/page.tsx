import { OBC_REGIONAL_ANTENNAS } from "@/lib/document-routing";
import { AdminRegionForm } from "@/components/auth/admin-region-form";
import { AuthCard } from "@/components/auth/auth-card";
import { SiteHeader } from "@/components/site-header";
import { requireRole } from "@/lib/auth";

type AdminRegionPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function AdminRegionPage({ searchParams }: AdminRegionPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/auth/admin-region");
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-2xl shadow-slate-200/50">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Accès OBC régional</p>
          <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
            Un administrateur ne voit et ne manipule que les données de son antenne.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Saisissez la clé unique de votre antenne. Le système identifie automatiquement la région et
            ouvre le tableau de bord uniquement sur les élèves et documents de cette antenne.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {OBC_REGIONAL_ANTENNAS.map((antenna) => (
              <div key={antenna.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="text-sm font-semibold text-white">{antenna.region}</div>
                <div className="mt-1 text-sm text-slate-300">{antenna.ville}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Exemple: la clé OBC-CENTRE-2026 donne automatiquement accès à l’antenne du Centre uniquement.
          </div>
        </section>

        <AuthCard
          title="Validation régionale"
          description={`Saisissez la clé unique de votre antenne OBC. Bonjour ${user.prenom}, vos accès seront limités à cette région.`}
        >
          <AdminRegionForm />
          {params?.next ? <p className="mt-4 text-xs text-muted-foreground">Destination: {params.next}</p> : null}
        </AuthCard>
      </main>
    </div>
  );
}
