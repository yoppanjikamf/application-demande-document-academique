import { CreditCard } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function PaymentsPage() {
  const user = await requireRole("ELEVE", "/dashboard/payments");
  const payments = await prisma.paiement.findMany({
    where: {
      OR: [{ duplicata: { eleveId: user.id } }, { documentAcademique: { eleveId: user.id } }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      duplicata: true,
      documentAcademique: true,
      recu: true,
    },
  });

  return (
    <DashboardShell
      role="ELEVE"
      userName={`${user.prenom} ${user.nom}`}
      activePath="/dashboard/payments"
      title="Paiements"
      subtitle="Suivi des paiements de duplicata et recus associes."
    >
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
          <span>Paiement</span>
          <span>Statut</span>
        </div>
        <div className="divide-y divide-slate-100">
          {payments.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm text-slate-500">Aucun paiement enregistre.</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="font-medium text-slate-950">{payment.duplicata.nomDuplicata}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {payment.modePaiment} · {payment.createdAt.toLocaleDateString("fr-FR")}
                  </p>
                  {payment.recu[0] ? (
                    <p className="text-sm text-slate-500">Recu: {payment.recu[0].numero}</p>
                  ) : null}
                </div>
                <StatusBadge tone={payment.statut === "EFFECTUE" ? "green" : "amber"}>{payment.statut}</StatusBadge>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
