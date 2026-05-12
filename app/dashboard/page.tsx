import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user) {
    redirect("/auth/login?next=/dashboard");
  }

  const dbUser = await prisma.user.findUnique({
    where: { authUserId: user.id },
    select: { nom: true, prenom: true, email: true, matricule: true, role: true },
  });

  if (!dbUser) {
    redirect("/auth/login?next=/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Connecte en tant que {dbUser.prenom} {dbUser.nom} ({dbUser.matricule}).
        </p>
        <p className="text-sm text-muted-foreground">Role : {dbUser.role}</p>
      </div>

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/account">Voir mon compte</Link>
        </Button>
      </div>
    </div>
  );
}
