import Link from "next/link";

import {
  ensureDocumentsForValidatedExams,
  getDocumentTitle,
  getPickupLocation,
  getStatusLabel,
} from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AppointmentDialog } from "@/components/documents/appointment-dialog";
import { Button } from "@/components/ui/button";

export default async function DocumentsPage() {
  const user = await requireRole("ELEVE", "/dashboard/documents");

  await ensureDocumentsForValidatedExams(user.id);

  const documents = await prisma.documentAcademique.findMany({
    where: { eleveId: user.id },
    orderBy: [{ diplomeType: "asc" }, { typeDocument: "asc" }],
    include: {
      rendezVous: {
        where: { statut: { in: ["PLANIFIE", "CONFIRME"] } },
        orderBy: { dateRdv: "asc" },
        take: 1,
      },
    },
  });

  const documentsWithLocation = await Promise.all(
    documents.map(async (document) => ({
      ...document,
      title: getDocumentTitle(document),
      location: await getPickupLocation(document),
      activeRendezVous: document.rendezVous[0] ?? null,
    })),
  );

  return (
    <DashboardShell
      role="ELEVE"
      activePath="/dashboard/documents"
      title="Mes documents"
      subtitle="Documents generes selon les examens deja composes et valides."
    >
      {documentsWithLocation.length === 0 ? (
        <p className="rounded-md border bg-card p-5 text-muted-foreground shadow-sm">
          Aucun document disponible pour votre parcours academique.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="grid grid-cols-[1fr_auto] border-b px-4 py-3 text-sm font-medium text-muted-foreground">
            <span>Document</span>
            <span>Action</span>
          </div>
          {documentsWithLocation.map((document) => (
            <div
              key={document.id}
              className="grid gap-4 border-b px-4 py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="space-y-1">
                <p className="text-lg font-semibold">{document.title}</p>
                <p className="text-sm text-muted-foreground">
                  Statut: {getStatusLabel(document.statut)} · Lieu: {document.location}
                </p>
                {document.activeRendezVous ? (
                  <p className="text-sm text-muted-foreground">
                    RDV: {document.activeRendezVous.dateRdv.toLocaleDateString("fr-FR")} ·{" "}
                    {document.activeRendezVous.heureRdv}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                {document.activeRendezVous ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/rendez-vous?documentId=${document.id}`}>Voir RDV</Link>
                  </Button>
                ) : (
                  <AppointmentDialog
                    documentId={document.id}
                    documentTitle={document.title}
                    disabled={document.statut !== "DISPONIBLE"}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
