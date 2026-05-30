import Link from "next/link";
import { Bell, CalendarDays, CreditCard, FileText, UserRound } from "lucide-react";

import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge, appointmentTone, documentTone } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireRole("ELEVE", "/dashboard");
  const [documentsCount, availableCount, rendezVousCount, paymentCount, recentDocuments, nextRendezVous, notifications] =
    await Promise.all([
    prisma.documentAcademique.count({ where: { eleveId: user.id } }),
    prisma.documentAcademique.count({ where: { eleveId: user.id, statut: "DISPONIBLE" } }),
    prisma.rendezVous.count({ where: { eleveId: user.id, statut: { in: ["PLANIFIE", "CONFIRME"] } } }),
    prisma.paiement.count({
      where: {
        OR: [{ duplicata: { eleveId: user.id } }, { documentAcademique: { eleveId: user.id } }],
      },
    }),
    prisma.documentAcademique.findMany({
      where: { eleveId: user.id },
      take: 5,
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.rendezVous.findMany({
      where: { eleveId: user.id, statut: { in: ["PLANIFIE", "CONFIRME"] } },
      take: 3,
      orderBy: [{ dateRdv: "asc" }, { heureRdv: "asc" }],
      include: { document: true },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      take: 3,
      orderBy: { dateEnvoi: "desc" },
    }),
  ]);

  return (
    <DashboardShell
      role="ELEVE"
      userName={`${user.prenom} ${user.nom}`}
      activePath="/dashboard"
      title="Espace élève"
      subtitle={`Connecte en tant que ${user.prenom} ${user.nom} · ${user.matricule}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documents" value={documentsCount} icon={<FileText className="h-5 w-5" />} />
        <StatCard
          label="Disponibles"
          value={availableCount}
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
          label="Paiements"
          value={paymentCount}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Accès rapides</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">Mes documents</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/rendez-vous">Mes rendez-vous</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account">
              <UserRound className="h-4 w-4" />
              Mon compte
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-950">Mes documents recents</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {recentDocuments.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">Aucun document rattache a votre matricule.</p>
            ) : (
              recentDocuments.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">{getDocumentTitle(document)}</p>
                    <p className="text-sm text-slate-500">{document.diplomeType}</p>
                  </div>
                  <StatusBadge tone={documentTone(document.statut)}>{getStatusLabel(document.statut)}</StatusBadge>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-950">Prochains rendez-vous</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {nextRendezVous.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500">Aucun rendez-vous actif.</p>
              ) : (
                nextRendezVous.map((rdv) => (
                  <div key={rdv.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">
                        {rdv.document ? getDocumentTitle(rdv.document) : "Document académique"}
                      </p>
                      <StatusBadge tone={appointmentTone(rdv.statut)}>{rdv.statut}</StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {rdv.dateRdv.toLocaleDateString("fr-FR")} · {rdv.heureRdv} · {rdv.lieu}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <Bell className="h-4 w-4 text-blue-700" />
              <h2 className="font-semibold text-slate-950">Notifications</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500">Aucune notification.</p>
              ) : (
                notifications.map((notification) => (
                  <p key={notification.id} className="line-clamp-2 px-5 py-4 text-sm text-slate-600">
                    {notification.message}
                  </p>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
