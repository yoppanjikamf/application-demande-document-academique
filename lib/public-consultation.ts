import { getDocumentTitle, getStudentDocumentStatusLabel } from "@/lib/appointment-service";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/client";

export type PublicConsultationDocument = {
  title: string;
  statut: string;
  statutLabel: string;
};

export type PublicConsultationResult =
  | { found: false }
  | {
      found: true;
      prenom: string;
      documents: PublicConsultationDocument[];
    };

export async function lookupPublicConsultationByMatricule(
  matriculeInput: string,
): Promise<PublicConsultationResult> {
  const matricule = matriculeInput.trim().toUpperCase();

  if (!matricule || matricule.length < 3 || matricule.length > 40) {
    return { found: false };
  }

  const eleve = await prisma.user.findUnique({
    where: { matricule },
    select: {
      role: true,
      prenom: true,
      documentsAcademique: {
        orderBy: [{ diplomeType: "asc" }, { typeDocument: "asc" }],
        select: {
          diplomeType: true,
          typeDocument: true,
          statut: true,
          demandeSoumiseAt: true,
        },
      },
    },
  });

  if (!eleve || eleve.role !== Role.ELEVE) {
    return { found: false };
  }

  const documents = eleve.documentsAcademique
    .filter((document) => document.typeDocument !== "DUPLICATA")
    .map((document) => ({
      title: getDocumentTitle(document),
      statut: document.statut,
      statutLabel: getStudentDocumentStatusLabel(document),
    }));

  return {
    found: true,
    prenom: eleve.prenom,
    documents,
  };
}
