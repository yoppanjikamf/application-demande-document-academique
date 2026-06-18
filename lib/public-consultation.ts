import {
  getDocumentTitle,
  getStudentDocumentStatusLabel,
} from "@/lib/appointment-service";
import { isDocumentRequestAllowed } from "@/lib/document-routing";
import type { DiplomePrincipal, StatutDocument } from "@/lib/generated/prisma/client";
import { Role, TypeDocument } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

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

type DocumentRecord = {
  diplomeType: DiplomePrincipal;
  typeDocument: TypeDocument;
  statut: StatutDocument;
  demandeSoumiseAt: Date | null;
};

function findDocumentForExam(
  documents: DocumentRecord[],
  diplomeType: DocumentRecord["diplomeType"],
  typeDocument: TypeDocument,
) {
  return (
    documents.find(
      (document) =>
        document.diplomeType === diplomeType && document.typeDocument === typeDocument,
    ) ?? null
  );
}

function toPublicConsultationDocument(
  diplomeType: DocumentRecord["diplomeType"],
  typeDocument: TypeDocument,
  document: DocumentRecord | null,
): PublicConsultationDocument {
  return {
    title: getDocumentTitle({ diplomeType, typeDocument }),
    statut: document?.demandeSoumiseAt ? document.statut : "PENDING",
    statutLabel: getStudentDocumentStatusLabel(document),
  };
}

export function buildPublicConsultationDocuments(
  exams: Array<{ diplomeType: DocumentRecord["diplomeType"] }>,
  documents: DocumentRecord[],
): PublicConsultationDocument[] {
  const entries: PublicConsultationDocument[] = [];

  for (const exam of exams) {
    if (isDocumentRequestAllowed(exam.diplomeType, "ORIGINAL")) {
      entries.push(
        toPublicConsultationDocument(
          exam.diplomeType,
          "ORIGINAL",
          findDocumentForExam(documents, exam.diplomeType, "ORIGINAL"),
        ),
      );
    }

    entries.push(
      toPublicConsultationDocument(
        exam.diplomeType,
        "RELEVE_NOTES",
        findDocumentForExam(documents, exam.diplomeType, "RELEVE_NOTES"),
      ),
    );
  }

  return entries;
}

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
      examensValides: {
        orderBy: { createdAt: "asc" },
        select: { diplomeType: true },
      },
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

  const documents = buildPublicConsultationDocuments(
    eleve.examensValides,
    eleve.documentsAcademique.filter((document) => document.typeDocument !== "DUPLICATA"),
  );

  return {
    found: true,
    prenom: eleve.prenom,
    documents,
  };
}
