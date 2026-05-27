import { getPageParams, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { getAdminDocumentScope } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const admin = await requireApiUser("ADMINISTRATEUR");
    const documentScope = getAdminDocumentScope(admin);
    const url = new URL(request.url);
    const search = url.searchParams.get("q")?.trim();
    const { page, limit, skip } = getPageParams(request);
    const where = {
      role: "ELEVE" as const,
      documentsAcademique: { some: documentScope },
      ...(search
        ? {
            OR: [
              { matricule: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { nom: { contains: search, mode: "insensitive" as const } },
              { prenom: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          matricule: true,
          email: true,
          nom: true,
          prenom: true,
          dateNaissance: true,
          createdAt: true,
          _count: {
            select: {
              documentsAcademique: { where: documentScope },
              eleveRendezVous: { where: { document: { is: documentScope } } },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return json({ students, pagination: { page, limit, total } });
  } catch (error) {
    return handleApiError(error);
  }
}
