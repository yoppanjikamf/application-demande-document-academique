import { getPageParams, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { getAdminDocumentScope } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const admin = await requireApiUser("ADMINISTRATEUR");
    const documentScope = getAdminDocumentScope(admin);
    const scopedDocuments = await prisma.documentAcademique.findMany({
      where: documentScope,
      select: { id: true, eleveId: true },
    });
    const scopedDocumentIds = scopedDocuments.map((document) => document.id);
    const scopedStudentIds = [...new Set(scopedDocuments.map((document) => document.eleveId))];

    // Paramètres de recherche et filtrage
    const url = new URL(request.url);
    const search = url.searchParams.get("q")?.trim();
    const action = url.searchParams.get("action");
    const resource = url.searchParams.get("resource");
    const userId = url.searchParams.get("userId");
    const { page, limit, skip } = getPageParams(request);

    // Constructeur la clause WHERE
    const searchWhere: Prisma.AuditLogWhereInput = {
      ...(action ? { action } : {}),
      ...(resource ? { resource } : {}),
      ...(userId ? { userId } : {}),
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: "insensitive" as const } },
              { resource: { contains: search, mode: "insensitive" as const } },
              { resourceId: { contains: search, mode: "insensitive" as const } },
              { details: { contains: search, mode: "insensitive" as const } },
              {
                user: {
                  OR: [
                    { matricule: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                    { nom: { contains: search, mode: "insensitive" as const } },
                    { prenom: { contains: search, mode: "insensitive" as const } },
                  ],
                },
              },
            ],
          }
        : {}),
    };
    const scopeWhere: Prisma.AuditLogWhereInput = {
      OR: [
        { resourceId: { in: scopedDocumentIds } },
        { userId: { in: scopedStudentIds } },
        {
          user: {
            organismeId: admin.organismeId,
            ...(admin.antenneRegionaleId ? { antenneRegionaleId: admin.antenneRegionaleId } : {}),
          },
        },
      ],
    };
    const where: Prisma.AuditLogWhereInput = { AND: [scopeWhere, searchWhere] };

    // Récupérer les logs d'audit avec pagination
    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              matricule: true,
              email: true,
              nom: true,
              prenom: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Formater les logs
    const formattedLogs = auditLogs.map((log) => {
      let parsedDetails: Record<string, unknown> | null = null;
      if (log.details) {
        try {
          parsedDetails = JSON.parse(log.details);
        } catch {
          parsedDetails = { raw: log.details };
        }
      }

      return {
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        details: parsedDetails,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        user: log.user
          ? {
              id: log.user.id,
              matricule: log.user.matricule,
              email: log.user.email,
              nom: log.user.nom,
              prenom: log.user.prenom,
              role: log.user.role,
            }
          : null,
      };
    });

    // Récupérer les statistiques des actions
    const actionStats = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: true,
      where,
    });

    return json({
      auditLogs: formattedLogs,
      pagination: { page, limit, total },
      stats: {
        totalActions: total,
        actionBreakdown: actionStats.map((stat) => ({
          action: stat.action,
          count: stat._count,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
