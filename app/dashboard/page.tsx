import Link from "next/link";
import { CalendarDays, FileText, UserRound } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireRole("ELEVE", "/dashboard");
  const [documentsCount, availableCount, rendezVousCount] = await Promise.all([
    prisma.documentAcademique.count({ where: { eleveId: user.id } }),
    prisma.documentAcademique.count({ where: { eleveId: user.id, statut: "DISPONIBLE" } }),
    prisma.rendezVous.count({ where: { eleveId: user.id } }),
  ]);

  return (
    <DashboardShell
      role="ELEVE"
      activePath="/dashboard"
      title="Espace eleve"
      subtitle={`Connecte en tant que ${user.prenom} ${user.nom} · ${user.matricule}`}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Documents" value={documentsCount} icon={<FileText className="h-5 w-5" />} />
        <StatCard
          label="Disponibles"
          value={availableCount}
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
        <h2 className="text-lg font-semibold">Acces rapides</h2>
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
    </DashboardShell>
  );
}
