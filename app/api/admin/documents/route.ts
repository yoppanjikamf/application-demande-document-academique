import { getDocumentTitle, getStatusLabel } from "@/lib/appointment-service";
import { getPageParams, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { getAdminDocumentScope } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { StatutDocument } from "@/lib/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const admin = await requireApiUser("ADMINISTRATEUR");
    const url = new URL(request.url);
    const status = url.searchParams.get("statut");
    const { page, limit, skip } = getPageParams(request);
    const where = {
      ...getAdminDocumentScope(admin),
      ...(status && status in StatutDocument ? { statut: status as StatutDocument } : {}),
    };
    const [documents, total] = await Promise.all([
      prisma.documentAcademique.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
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
            where: { statut: { in: ["PLANIFIE", "CONFIRME"] } },
            orderBy: { dateRdv: "asc" },
            take: 1,
          },
        },
      }),
      prisma.documentAcademique.count({ where }),
    ]);

    return json({
      documents: documents.map((document) => ({
        ...document,
        title: getDocumentTitle(document),
        statusLabel: getStatusLabel(document.statut),
        activeAppointment: document.rendezVous[0] ?? null,
      })),
      pagination: { page, limit, total },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
