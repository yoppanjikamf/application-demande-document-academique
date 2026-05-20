import Link from "next/link";
import { CalendarDays, FileText, UsersRound } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin");

  const [elevesCount, documentsCount, rendezVousCount, documentsDisponibles] = await Promise.all([
    prisma.user.count({ where: { role: "ELEVE" } }),
    prisma.documentAcademique.count(),
    prisma.rendezVous.count(),
    prisma.documentAcademique.count({ where: { statut: "DISPONIBLE" } }),
  ]);

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      activePath="/admin"
      title="Administration OBC"
      subtitle={`Connecte en tant que ${user.prenom} ${user.nom}${user.nomService ? ` · ${user.nomService}` : ""}`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Eleves" value={elevesCount} icon={<UsersRound className="h-5 w-5" />} />
        <StatCard label="Documents" value={documentsCount} icon={<FileText className="h-5 w-5" />} />
        <StatCard
          label="Disponibles"
          value={documentsDisponibles}
          icon={<FileText className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label="Rendez-vous"
          value={rendezVousCount}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <div className="rounded-md border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/documents">Verifier les documents</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/rdv-disponibilites">Configurer les disponibilites</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/import">Importer CSV</Link>
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
