import { getDocumentTitle } from "@/lib/appointment-service";
import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function AdminWithdrawalsPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin/withdrawals");
  const withdrawals = await prisma.rendezVous.findMany({
    where: { statut: "HONORE", document: { is: getAdminDocumentScope(user) } },
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
    include: {
      eleve: true,
      admin: true,
      document: { include: { organisme: true, antenneRegionale: true } },
    },
  });

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      userName={`${user.prenom} ${user.nom}`}
      activePath="/admin/withdrawals"
      title="Historique des retraits"
      subtitle="Trace des documents remis physiquement aux élèves."
    >
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
          <span>Retrait</span>
          <span>Statut</span>
        </div>
        <div className="divide-y divide-slate-100">
          {withdrawals.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">Aucun retrait honore.</p>
          ) : (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-medium text-slate-950">
                    {withdrawal.document ? getDocumentTitle(withdrawal.document) : "Document académique"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {withdrawal.eleve.prenom} {withdrawal.eleve.nom} · {withdrawal.eleve.matricule}
                  </p>
                  <p className="text-sm text-slate-500">
                    Service: {withdrawal.admin.prenom} {withdrawal.admin.nom} ·{" "}
                    {withdrawal.updatedAt.toLocaleDateString("fr-FR")}
                  </p>
                  {withdrawal.document ? (
                    <p className="text-sm text-slate-500">
                      {withdrawal.document.organisme?.nom ?? "Organisme non defini"}
                      {withdrawal.document.antenneRegionale ? ` · ${withdrawal.document.antenneRegionale.nom}` : ""}
                    </p>
                  ) : null}
                </div>
                <StatusBadge tone="blue">HONORE</StatusBadge>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
