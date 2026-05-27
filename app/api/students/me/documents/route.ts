import {
  ACTIVE_RENDEZ_VOUS_STATUSES,
  ensureDocumentsForValidatedExams,
  getDocumentTitle,
  getPickupLocation,
  getStatusLabel,
} from "@/lib/appointment-service";
import { handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireApiUser("ELEVE");
    await ensureDocumentsForValidatedExams(user.id);

    const documents = await prisma.documentAcademique.findMany({
      where: { eleveId: user.id },
      orderBy: [{ diplomeType: "asc" }, { typeDocument: "asc" }],
      include: {
        rendezVous: {
          where: { statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] } },
          orderBy: { dateRdv: "asc" },
          take: 1,
        },
      },
    });

    const data = await Promise.all(
      documents.map(async (document) => ({
        ...document,
        title: getDocumentTitle(document),
        statusLabel: getStatusLabel(document.statut),
        location: await getPickupLocation(document),
        activeAppointment: document.rendezVous[0] ?? null,
      })),
    );

    return json({ documents: data });
  } catch (error) {
    return handleApiError(error);
  }
}
