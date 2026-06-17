import { CreditCard, Download, Eye } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DashboardListPanel,
  DashboardListPanelHeader,
} from "@/components/dashboard/dashboard-list-panel";
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
      userId={user.id}
      userName={`${user.prenom} ${user.nom}`}
      userMatricule={user.matricule}
      activePath="/dashboard/payments"
      title="Paiements"
      subtitle="Vos paiements de duplicata et leurs reçus, téléchargeables à tout moment."
    >
      <DashboardListPanel>
        <DashboardListPanelHeader left="Paiement" right="Statut" />
        <div className="divide-y divide-[#E8EEF6]">
          {payments.length === 0 ? (
            <div className="px-4 py-10 text-center sm:px-5">
              <CreditCard className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-3 text-sm text-text-3">Aucun paiement enregistré pour le moment.</p>
            </div>
          ) : (
            payments.map((payment) => {
              const receipt = payment.recu[0] ?? null;
              return (
                <article
                  key={payment.id}
                  className="flex flex-col gap-4 px-4 py-4 sm:px-5 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-text-1">{payment.duplicata.nomDuplicata}</p>
                    <p className="mt-1 text-sm text-text-3">
                      {payment.modePaiment} · {payment.createdAt.toLocaleDateString("fr-FR")}
                    </p>
                    {receipt ? (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                        <span className="break-all text-sm text-text-3">Reçu : {receipt.numero}</span>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <a
                            href={`/api/students/me/payments/${payment.id}/receipt`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Eye className="h-4 w-4" />
                            Voir le reçu
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <a href={`/api/students/me/payments/${payment.id}/receipt?download=1`}>
                            <Download className="h-4 w-4" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-text-3">
                        Le reçu sera disponible après confirmation du paiement.
                      </p>
                    )}
                  </div>
                  <StatusBadge tone={paymentTone(payment.statut)}>{payment.statut}</StatusBadge>
                </article>
              );
            })
          )}
        </div>
      </DashboardListPanel>
    </DashboardShell>
  );
}
