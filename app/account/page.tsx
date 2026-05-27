import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const dateValue = user.dateNaissance
    ? user.dateNaissance.toISOString().split("T")[0]
    : "";

  return (
    <DashboardShell
      role={user.role}
      userName={`${user.prenom} ${user.nom}`}
      activePath="/account"
      title="Compte"
      subtitle="Coordonnees et informations personnelles du profil connecte."
    >
      <div className="max-w-2xl rounded-md border border-slate-200 bg-white p-6 shadow-sm">
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
    </DashboardShell>
  );
}
