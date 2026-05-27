import {
  ACTIVE_RENDEZ_VOUS_STATUSES,
  getDocumentTitle,
  getPickupLocation,
  getStatusLabel,
} from "@/lib/appointment-service";
import { ApiError, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("ELEVE");
    const { documentId } = await params;
    const document = await prisma.documentAcademique.findFirst({
      where: { id: documentId, eleveId: user.id },
      include: {
        rendezVous: {
          where: { statut: { in: [...ACTIVE_RENDEZ_VOUS_STATUSES] } },
          orderBy: { dateRdv: "asc" },
          take: 1,
        },
      },
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    return json({
      document: {
        ...document,
        title: getDocumentTitle(document),
        statusLabel: getStatusLabel(document.statut),
        location: await getPickupLocation(document),
        activeAppointment: document.rendezVous[0] ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
