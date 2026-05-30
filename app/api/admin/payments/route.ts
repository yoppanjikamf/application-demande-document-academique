import { getPageParams, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { getAdminDocumentScope } from "@/lib/document-routing";
import { Prisma, type StatutPaiement } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const admin = await requireApiUser("ADMINISTRATEUR");
    const documentScope = getAdminDocumentScope(admin);
    const url = new URL(request.url);

    // Paramètres de recherche et filtrage
    const search = url.searchParams.get("q")?.trim();
    const statut = url.searchParams.get("statut");
    const { page, limit, skip } = getPageParams(request);

    // Construire la clause WHERE
    const where: Prisma.PaiementWhereInput = {
      OR: [
        { documentAcademique: { is: { ...documentScope } } },
        { duplicata: { is: { ...documentScope } } },
      ],
      ...(statut && ["EN_ATTENTE", "EFFECTUE", "ANNULE"].includes(statut)
        ? { statut: statut as StatutPaiement }
        : {}),
      ...(search
        ? {
            AND: [
              {
                OR: [
                  {
                    duplicata: { nomDuplicata: { contains: search, mode: "insensitive" as const } },
                  },
                  {
                    duplicata: {
                      eleve: { matricule: { contains: search, mode: "insensitive" as const } },
                    },
                  },
                  {
                    duplicata: {
                      eleve: { email: { contains: search, mode: "insensitive" as const } },
                    },
                  },
                  {
                    documentAcademique: {
                      eleve: { matricule: { contains: search, mode: "insensitive" as const } },
                    },
                  },
                  {
                    documentAcademique: {
                      eleve: { email: { contains: search, mode: "insensitive" as const } },
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    };

    // Récupérer les paiements avec pagination
    const [payments, total] = await Promise.all([
      prisma.paiement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          duplicata: {
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
            },
          },
          documentAcademique: {
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
            },
          },
          recu: {
            select: {
              id: true,
              numero: true,
              montant: true,
              dateEmission: true,
            },
          },
        },
      }),
      prisma.paiement.count({ where }),
    ]);

    // Formater les réponses
    const formattedPayments = payments.map((payment) => {
      const isFromDuplicata = !!payment.duplicata;
      const eleve = isFromDuplicata ? payment.duplicata.eleve : payment.documentAcademique?.eleve;
      const documentTitle = isFromDuplicata
        ? payment.duplicata.nomDuplicata
        : payment.documentAcademique?.diplomeType;

      return {
        id: payment.id,
        statut: payment.statut,
        modePaiement: payment.modePaiment,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        eleve: eleve
          ? {
              id: eleve.id,
              matricule: eleve.matricule,
              email: eleve.email,
              nom: eleve.nom,
              prenom: eleve.prenom,
            }
          : null,
        documentTitle,
        typeSource: isFromDuplicata ? "DUPLICATA" : "DOCUMENT_ACADEMIQUE",
        recu: payment.recu && payment.recu.length > 0 ? payment.recu[0] : null,
      };
    });

    return json({
      payments: formattedPayments,
      pagination: { page, limit, total },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
