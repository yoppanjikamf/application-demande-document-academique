import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const dateValue = user.dateNaissance
    ? user.dateNaissance.toISOString().split("T")[0]
    : "";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Compte</h1>
        <p className="text-muted-foreground">
          Mettez a jour vos informations personnelles.
        </p>
      </div>

      <ProfileForm
        role={user.role}
        email={user.email}
        defaultValues={{
          nom: user.nom,
          prenom: user.prenom,
          dateNaissance: dateValue,
          nomService: user.nomService ?? "",
        }}
      />
    </div>
  );
}
