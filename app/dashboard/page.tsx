import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireRole("ELEVE", "/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Espace eleve</h1>
        <p className="text-muted-foreground">
          Connecte en tant que {user.prenom} {user.nom} ({user.matricule}).
        </p>
        <p className="text-sm text-muted-foreground">Role : {user.role}</p>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/account">Voir mon compte</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/documents">Mes documents</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/rendezvous">Mes retraits</Link>
        </Button>
      </div>
    </div>
  );
}
