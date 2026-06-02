import { requireUser } from "@/lib/auth";
import { getAdminScopeLabel } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/profile-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const dateValue = user.dateNaissance ? user.dateNaissance.toISOString().split("T")[0] : "";
  const centreExamen =
    user.role === "AGENT_CENTRE_EXAMEN" && user.centreExamenId
      ? await prisma.centreExamen.findUnique({ where: { id: user.centreExamenId } })
      : null;
  const scopeLabel =
    user.role === "ADMINISTRATEUR"
      ? getAdminScopeLabel(user)
      : user.role === "AGENT_CENTRE_EXAMEN"
        ? (centreExamen?.nom ?? "Centre d'examen")
        : undefined;

  return (
    <DashboardShell
      role={user.role}
      organismeId={user.organismeId}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      scopeLabel={scopeLabel}
      activePath="/account"
      title="Compte"
      subtitle="Coordonnees et informations personnelles du profil connecte."
    >
      <div className="max-w-2xl rounded-md border border-slate-200 bg-surface-0 p-6 shadow-card">
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
