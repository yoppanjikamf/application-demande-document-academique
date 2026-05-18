import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function ProfileTestPage() {
  const user = await requireUser("/test/profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Test profil</h1>
        <p className="text-muted-foreground">
          Connecte en tant que {user.prenom} {user.nom} ({user.matricule}).
        </p>
      </div>

      <div className="rounded-md border p-4 text-sm text-muted-foreground">
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/account">Modifier mon profil</Link>
        </Button>
      </div>
    </div>
  );
}
