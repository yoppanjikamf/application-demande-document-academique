import { handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireApiUser("ADMINISTRATEUR");
    const [students, documents, pendingDocuments, availableDocuments, retiredDocuments, appointments] =
      await Promise.all([
        prisma.user.count({ where: { role: "ELEVE" } }),
        prisma.documentAcademique.count(),
        prisma.documentAcademique.count({ where: { statut: "PAS_DISPONIBLE" } }),
        prisma.documentAcademique.count({ where: { statut: "DISPONIBLE" } }),
        prisma.documentAcademique.count({ where: { statut: "RETIRE" } }),
        prisma.rendezVous.findMany({
          where: { statut: "HONORE" },
          select: { createdAt: true, updatedAt: true },
        }),
      ]);

    const totalDelayMs = appointments.reduce(
      (sum, appointment) => sum + (appointment.updatedAt.getTime() - appointment.createdAt.getTime()),
      0,
    );
    const averageWithdrawalDelayDays =
      appointments.length > 0 ? totalDelayMs / appointments.length / 1000 / 60 / 60 / 24 : 0;

    return json({
      stats: {
        students,
        documents,
        pendingDocuments,
        availableDocuments,
        retiredDocuments,
        honoredAppointments: appointments.length,
        averageWithdrawalDelayDays,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
