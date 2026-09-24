import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StudentPaymentsView } from "@/components/dashboard/student-payments-view";

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
      titleKey="dashboard.studentPaymentsTitle"
      subtitleKey="dashboard.studentPaymentsSubtitle"
    >
      <StudentPaymentsView
        payments={payments.map((payment) => ({
          id: payment.id,
          name: payment.duplicata.nomDuplicata,
          mode: payment.modePaiment,
          createdAt: payment.createdAt.toISOString(),
          statut: payment.statut,
          receiptNumber: payment.recu[0]?.numero ?? null,
        }))}
      />
    </DashboardShell>
  );
}
