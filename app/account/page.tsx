import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const dbUser = await prisma.user.findUnique({
    where: { authUserId: user.id },
    select: {
      email: true,
      matricule: true,
      nom: true,
      prenom: true,
      role: true,
      dateNaissance: true,
      nomService: true,
      derniereConnexion: true,
    },
  });

  if (!dbUser) {
    redirect("/auth/login?next=/account");
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Compte</h1>
      <p className="text-muted-foreground">Nom : {dbUser.nom}</p>
      <p className="text-muted-foreground">Prenom : {dbUser.prenom}</p>
      <p className="text-muted-foreground">Matricule : {dbUser.matricule}</p>
      <p className="text-muted-foreground">Email : {dbUser.email}</p>
      <p className="text-muted-foreground">Role : {dbUser.role}</p>
      {dbUser.nomService ? (
        <p className="text-muted-foreground">Service : {dbUser.nomService}</p>
      ) : null}
      {dbUser.dateNaissance ? (
        <p className="text-muted-foreground">
          Date de naissance : {dbUser.dateNaissance.toLocaleDateString("fr-FR")}
        </p>
      ) : null}
    </div>
  );
}
