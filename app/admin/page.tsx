import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin");

  const [elevesCount, documentsCount, rendezVousCount] = await Promise.all([
    prisma.user.count({ where: { role: "ELEVE" } }),
    prisma.documentAcademique.count(),
    prisma.rendezVous.count(),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Administration OBC</h1>
        <p className="text-muted-foreground">
          Connecte en tant que {user.prenom} {user.nom} ({user.matricule}).
        </p>
        {user.nomService ? (
          <p className="text-sm text-muted-foreground">Service : {user.nomService}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Eleves</p>
          <p className="text-2xl font-semibold">{elevesCount}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Documents</p>
          <p className="text-2xl font-semibold">{documentsCount}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Rendez-vous</p>
          <p className="text-2xl font-semibold">{rendezVousCount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/account">Voir mon compte</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/rdv-disponibilites">Creneaux RDV</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/import">Importer CSV</Link>
        </Button>
      </div>
    </div>
  );
}
