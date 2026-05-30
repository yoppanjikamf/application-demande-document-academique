import Link from "next/link";
import { CalendarDays, FileText, ListChecks, UsersRound } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge, appointmentTone, documentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";

export default async function AdminPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin");
  const documentScope = getAdminDocumentScope(user);

  const [
    elevesCount,
    documentsCount,
    rendezVousCount,
    documentsDisponibles,
    documentsEnAttente,
    retraitsCount,
    recentDocuments,
    nextAppointments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "ELEVE", documentsAcademique: { some: documentScope } } }),
    prisma.documentAcademique.count({ where: documentScope }),
    prisma.rendezVous.count({ where: { statut: { in: ["PLANIFIE", "CONFIRME"] }, document: { is: documentScope } } }),
    prisma.documentAcademique.count({ where: { ...documentScope, statut: "DISPONIBLE" } }),
    prisma.documentAcademique.count({ where: { ...documentScope, statut: "PAS_DISPONIBLE" } }),
    prisma.rendezVous.count({ where: { statut: "HONORE", document: { is: documentScope } } }),
    prisma.documentAcademique.findMany({
      where: documentScope,
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { eleve: true },
    }),
    prisma.rendezVous.findMany({
      where: { statut: { in: ["PLANIFIE", "CONFIRME"] }, document: { is: documentScope } },
      take: 5,
      orderBy: [{ dateRdv: "asc" }, { heureRdv: "asc" }],
      include: { eleve: true, document: true },
    }),
  ]);

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      userName={`${user.prenom} ${user.nom}`}
      activePath="/admin"
      title={`Administration ${user.nomService ?? ""}`.trim()}
      subtitle={`Connecte en tant que ${user.prenom} ${user.nom}${user.nomService ? ` · ${user.nomService}` : ""}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Élèves" value={elevesCount} icon={<UsersRound className="h-5 w-5" />} />
        <StatCard
          label="Documents"
          value={documentsCount}
          icon={<FileText className="h-5 w-5" />}
          description={`${documentsEnAttente} en attente de traitement`}
        />
        <StatCard
          label="Disponibles"
          value={documentsDisponibles}
          icon={<FileText className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label="RDV actifs"
          value={rendezVousCount}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Retraits honores"
          value={retraitsCount}
          icon={<ListChecks className="h-5 w-5" />}
          tone="green"
        />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/documents">Verifier les documents</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/rdv-disponibilites">Configurer les disponibilités</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/import">Importer CSV</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Documents recents</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentDocuments.map((document) => (
              <div key={document.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-950">{getDocumentTitle(document)}</p>
                  <p className="text-sm text-slate-500">
                    {document.eleve.prenom} {document.eleve.nom} · {document.eleve.matricule}
                  </p>
                </div>
                <StatusBadge tone={documentTone(document.statut)}>{getStatusLabel(document.statut)}</StatusBadge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Prochains rendez-vous</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {nextAppointments.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">Aucun rendez-vous actif.</p>
            ) : (
              nextAppointments.map((rdv) => (
                <div key={rdv.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">
                      {rdv.document ? getDocumentTitle(rdv.document) : "Document académique"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {rdv.dateRdv.toLocaleDateString("fr-FR")} · {rdv.heureRdv} · {rdv.eleve.matricule}
                    </p>
                  </div>
                  <StatusBadge tone={appointmentTone(rdv.statut)}>{rdv.statut}</StatusBadge>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
