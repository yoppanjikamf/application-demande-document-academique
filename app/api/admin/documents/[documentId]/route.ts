import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";
import { ApiError, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireApiUser("ADMINISTRATEUR");
    const { documentId } = await params;
    const document = await prisma.documentAcademique.findUnique({
      where: { id: documentId },
      include: {
        eleve: {
          select: {
            id: true,
            matricule: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
        rendezVous: {
          orderBy: [{ dateRdv: "desc" }, { createdAt: "desc" }],
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
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
