import { getDocumentTitle, getPickupLocation } from "@/lib/appointment-service";
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
    });

    if (!document) {
      throw new ApiError("Document introuvable.", 404);
    }

    const appointmentRequired = document.typeDocument !== "RELEVE_NOTES";
    const pieces = ["Carte scolaire ou CNI", "Accuse de reception ou numero de demande"];

    if (document.typeDocument === "DUPLICATA") {
      pieces.push("Recu de paiement du duplicata");
    }

    return json({
      instructions: {
        documentId: document.id,
        title: getDocumentTitle(document),
        available: document.statut === "DISPONIBLE",
        appointmentRequired,
        location: await getPickupLocation(document),
        openingHours: "Lundi a vendredi, 08:00-16:00",
        estimatedDuration: "30 minutes",
        pieces,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
