import Link from "next/link";

import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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
      activePath="/dashboard/rendez-vous"
      title="Mes rendez-vous"
      subtitle="Suivi des rendez-vous de retrait lies a vos documents academiques."
    >
      {rendezVous.length === 0 ? (
        <div className="space-y-3 rounded-md border bg-card p-5 shadow-sm">
          <p className="text-muted-foreground">Aucun rendez-vous trouve.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">Retour aux documents</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="grid grid-cols-[1fr_auto] border-b px-4 py-3 text-sm font-medium text-muted-foreground">
            <span>Rendez-vous</span>
            <span>Statut</span>
          </div>
          {rendezVous.map((rdv) => (
            <div key={rdv.id} className="grid gap-3 border-b px-4 py-4 last:border-0 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-lg font-semibold">
                  {rdv.document ? getDocumentTitle(rdv.document) : "Document academique"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {rdv.dateRdv.toLocaleDateString("fr-FR")} · {rdv.heureRdv} · {rdv.lieu}
                </p>
              </div>
              <p className="self-start rounded-md bg-accent px-3 py-1 text-sm font-medium">{rdv.statut}</p>
              <p className="text-sm text-muted-foreground">
                Agent: {rdv.admin.prenom} {rdv.admin.nom}
              </p>
              {rdv.commentaire ? (
                <p className="text-sm text-muted-foreground">Commentaire: {rdv.commentaire}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
