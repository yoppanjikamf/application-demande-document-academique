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
      subtitle="Vos rendez-vous de retrait, avec la date, l'heure et le lieu où vous présenter."
    >
      {rendezVous.length === 0 ? (
        <div className="space-y-3 rounded-md border border-[var(--border-token)] bg-surface-0 p-5 shadow-card">
          <p className="text-text-3">Vous n&apos;avez aucun rendez-vous pour le moment.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">Retour à mes documents scolaires</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {rendezVous.map((rdv) => (
            <article
              key={rdv.id}
              className="rounded-md border border-[var(--border-token)] bg-surface-0 p-4 shadow-card"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-lg font-semibold leading-snug text-text-1">
                    {rdv.document ? getDocumentTitle(rdv.document) : "Document scolaire"}
                  </p>
                  <p className="break-words text-sm leading-6 text-text-3">
                    <span className="font-medium text-text-2">Date :</span>{" "}
                    {rdv.dateRdv.toLocaleDateString("fr-FR")} · {rdv.heureRdv}
                  </p>
                  <p className="break-words text-sm leading-6 text-text-3">
                    <span className="font-medium text-text-2">Lieu :</span> {rdv.lieu}
                  </p>
                  <p className="break-words text-sm leading-6 text-text-3">
                    <span className="font-medium text-text-2">Agent :</span> {rdv.admin.prenom}{" "}
                    {rdv.admin.nom}
                  </p>
                  {rdv.commentaire ? (
                    <p className="break-words text-sm leading-6 text-text-3">
                      <span className="font-medium text-text-2">Commentaire :</span>{" "}
                      {rdv.commentaire}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                  <StatusBadge tone={appointmentTone(rdv.statut)}>{rdv.statut}</StatusBadge>
                  {rdv.statut === "PLANIFIE" || rdv.statut === "CONFIRME" ? (
                    <form action={cancelRendezVousAction}>
                      <input type="hidden" name="rendezVousId" value={rdv.id} />
                      <Button type="submit" size="sm" variant="outline" className="w-full sm:w-auto">
                        Annuler
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
