import { getAntennesForOrganisme, getOrganismeNameById } from "@/lib/document-routing";
import { AdminRegionForm } from "@/components/auth/admin-region-form";
import { AuthCard } from "@/components/auth/auth-card";
import { requireRole } from "@/lib/auth";

type AdminRegionPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function AdminRegionPage({ searchParams }: AdminRegionPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/auth/admin-region");
  const params = await searchParams;
  const organismeName = getOrganismeNameById(user.organismeId) ?? "ADMIN";
  const antennas = user.organismeId ? getAntennesForOrganisme(user.organismeId) : [];

  return (
    <div className="min-h-screen bg-surface-1">
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <section className="rounded-lg border border-[var(--border-token)] bg-obc-800 p-8 text-white shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Accès régional {organismeName}
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
            Un administrateur ne voit et ne manipule que les données de son antenne.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Saisissez la clé unique de votre antenne. Le système identifie automatiquement la région
            et ouvre le tableau de bord uniquement sur les élèves et documents de cette antenne.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {antennas.map((antenna) => (
              <div key={antenna.id} className="rounded-md border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">{antenna.region}</div>
                <div className="mt-1 text-sm text-white/70">{antenna.ville}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-md border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Exemple: la clé {organismeName}-CENTRE-2026 donne automatiquement accès à l’antenne du
            Centre uniquement.
          </div>
        </section>

        <AuthCard
          title="Validation régionale"
          description={`Saisissez la clé unique de votre antenne ${organismeName}. Bonjour ${user.prenom}, vos accès seront limités à cette région.`}
        >
          <AdminRegionForm />
          {params?.next ? (
            <p className="mt-4 text-xs text-muted-foreground">Destination: {params.next}</p>
          ) : null}
        </AuthCard>
      </main>
    </div>
  );
}
