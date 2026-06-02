import { CreditCard, Download, Eye } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { paymentTone, StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";

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
      userMatricule={user.matricule}
      activePath="/dashboard/payments"
      title="Paiements"
      subtitle="Suivi des paiements de duplicata et reçus associés."
    >
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_auto] border-b border-[#E5E7EB] bg-[#F8F9FA] px-5 py-3 text-sm font-medium text-[#6B7280]">
          <span>Paiement</span>
          <span>Statut</span>
        </div>
        <div className="divide-y divide-[#E8EEF6]">
          {payments.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-[#9CA3AF]" />
              <p className="mt-3 text-sm text-[#6B7280]">Aucun paiement enregistré.</p>
            </div>
          ) : (
            payments.map((payment) => {
              const receipt = payment.recu[0] ?? null;
              return (
                <div
                  key={payment.id}
                  className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-medium text-[#111827]">{payment.duplicata.nomDuplicata}</p>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {payment.modePaiment} · {payment.createdAt.toLocaleDateString("fr-FR")}
                    </p>
                    {receipt ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-[#6B7280]">Reçu : {receipt.numero}</span>
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={`/api/students/me/payments/${payment.id}/receipt`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Eye className="h-4 w-4" />
                            Voir le reçu
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <a href={`/api/students/me/payments/${payment.id}/receipt?download=1`}>
                            <Download className="h-4 w-4" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-[#6B7280]">
                        Le reçu sera disponible après confirmation du paiement.
                      </p>
                    )}
                  </div>
                  <StatusBadge tone={paymentTone(payment.statut)}>{payment.statut}</StatusBadge>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
