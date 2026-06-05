import Link from "next/link";

import { cancelRendezVousAction } from "@/app/dashboard/actions";
import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge, appointmentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

type RendezVousPageProps = {
  searchParams?: Promise<{ documentId?: string }>;
};

export default async function RendezVousPage({ searchParams }: RendezVousPageProps) {
  const user = await requireRole("ELEVE", "/dashboard/rendez-vous");
  const params = await searchParams;

  const rendezVous = await prisma.rendezVous.findMany({
    where: {
      eleveId: user.id,
      ...(params?.documentId ? { documentId: params.documentId } : {}),
    },
    orderBy: [{ dateRdv: "desc" }, { createdAt: "desc" }],
    include: {
      document: true,
      admin: true,
    },
  });

  return (
    <DashboardShell
      role="ELEVE"
      userId={user.id}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      activePath="/dashboard/rendez-vous"
      title="Mes rendez-vous"
      subtitle="Suivi des rendez-vous de retrait liés à vos documents scolaires."
    >
      {rendezVous.length === 0 ? (
        <div className="space-y-3 rounded-md border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <p className="text-text-3">Aucun rendez-vous trouve.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">Retour à mes documents scolaires</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--border-token)] bg-surface-0 shadow-card">
          <div className="grid grid-cols-[1fr_auto] border-b border-[var(--border-token)] bg-surface-1 px-4 py-3 text-sm font-medium text-text-3">
            <span>Rendez-vous</span>
            <span>Statut</span>
          </div>
          {rendezVous.map((rdv) => (
            <div
              key={rdv.id}
              className="grid gap-3 border-b px-4 py-4 last:border-0 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-lg font-semibold text-text-1">
                  {rdv.document ? getDocumentTitle(rdv.document) : "Document scolaire"}
                </p>
                <p className="text-sm text-text-3">
                  {rdv.dateRdv.toLocaleDateString("fr-FR")} · {rdv.heureRdv} · {rdv.lieu}
                </p>
              </div>
              <StatusBadge tone={appointmentTone(rdv.statut)} className="self-start">
                {rdv.statut}
              </StatusBadge>
              <p className="text-sm text-text-3">
                Agent: {rdv.admin.prenom} {rdv.admin.nom}
              </p>
              {rdv.commentaire ? (
                <p className="text-sm text-text-3">Commentaire: {rdv.commentaire}</p>
              ) : null}
              {rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME" ? (
                <form action={cancelRendezVousAction}>
                  <input type="hidden" name="rendezVousId" value={rdv.id} />
                  <Button type="submit" size="sm" variant="outline">
                    Annuler
                  </Button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
