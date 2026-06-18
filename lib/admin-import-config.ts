import type { AuthenticatedUser } from "@/lib/auth";
import {
  AVAILABILITY_IMPORT_CSV_HEADER,
  STUDENT_IMPORT_CSV_HEADER,
} from "@/lib/admin-student-import.constants";
import { getAdminScopeLabel, getOrganismeNameById, ORGANISME_IDS } from "@/lib/document-routing";

export type AdminImportPresentation = {
  organismeName: "OBC" | "DECC";
  scopeLabel?: string;
  regionSlug: string;
  demoCsvBasePath: string;
  studentImport: {
    title: string;
    description: string;
    bullets: string[];
    templateUrl: string;
    demoFileHint: string;
    csvHeader: string;
  };
  availabilityImport: {
    title: string;
    description: string;
    bullets: string[];
    templateUrl: string;
    demoFileHint: string;
    csvHeader: string;
  };
};

function slugifyRegion(region: string) {
  return region
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getRegionSlug(user: AuthenticatedUser) {
  const scope = getAdminScopeLabel(user);
  const region = scope?.split(" - ")[1];
  return region ? slugifyRegion(region) : "centre";
}

export function getAdminImportPresentation(user: AuthenticatedUser): AdminImportPresentation | null {
  const organismeName = getOrganismeNameById(user.organismeId);
  if (organismeName !== "OBC" && organismeName !== "DECC") {
    return null;
  }

  const regionSlug = getRegionSlug(user);
  const demoCsvBasePath = `docs/csv-demo/${regionSlug}/${organismeName.toLowerCase()}`;
  const regionLabel = getAdminScopeLabel(user)?.split(" - ")[1] ?? "Centre";

  if (organismeName === "OBC") {
    return {
      organismeName,
      scopeLabel: getAdminScopeLabel(user),
      regionSlug,
      demoCsvBasePath,
      studentImport: {
        title: "Import élèves — Probatoire / Baccalauréat",
        description: `Fichier régional OBC (${regionLabel}) : une ligne peut créer ou mettre à jour un élève, son examen et une fiche document en Pas disponible. Probatoire et Baccalauréat uniquement.`,
        bullets: [
          "Colonnes obligatoires : matricule, email, nom, prénom",
          "Colonnes utiles : diplome_type (PROBATOIRE ou BACCALAUREAT), document_type, annee_session, centre_examen, region_composition",
          `region_composition doit être « ${regionLabel} » pour votre antenne`,
          "Statut initial des documents : Pas disponible",
        ],
        templateUrl: "/templates/obc/import-eleves.csv",
        demoFileHint: `${demoCsvBasePath}/import-eleves-probatoire-bac.csv`,
        csvHeader: STUDENT_IMPORT_CSV_HEADER,
      },
      availabilityImport: {
        title: "Disponibilisation — Probatoire / Baccalauréat",
        description: `Passe les relevés et diplômes OBC à Disponible en une étape. L'élève doit exister dans votre région ; la fiche document est créée automatiquement si besoin.`,
        bullets: [
          "Colonnes obligatoires : matricule, diplome_type, document_type",
          "Colonnes utiles : annee_session, region_composition, centre_examen",
          "Probatoire (relevé) et Baccalauréat (relevé, original) uniquement",
          "Notification automatique après chaque passage à Disponible",
        ],
        templateUrl: "/templates/obc/import-disponibilisation.csv",
        demoFileHint: `${demoCsvBasePath}/import-disponibilisation-probatoire-bac.csv`,
        csvHeader: AVAILABILITY_IMPORT_CSV_HEADER,
      },
    };
  }

  return {
    organismeName,
    scopeLabel: getAdminScopeLabel(user),
    regionSlug,
    demoCsvBasePath,
    studentImport: {
      title: "Import élèves — BEPC",
      description: `Fichier régional DECC (${regionLabel}) : élèves ayant composé le BEPC, avec fiches original et/ou relevé en Pas disponible.`,
      bullets: [
        "Colonnes obligatoires : matricule, email, nom, prénom",
        "diplome_type : BEPC uniquement",
        "document_type : ORIGINAL ou RELEVE_NOTES",
        `region_composition : « ${regionLabel} »`,
      ],
      templateUrl: "/templates/decc/import-eleves.csv",
      demoFileHint: `${demoCsvBasePath}/import-eleves-bepc.csv`,
      csvHeader: STUDENT_IMPORT_CSV_HEADER,
    },
    availabilityImport: {
      title: "Disponibilisation — BEPC",
      description: `Disponibilise les originaux et relevés BEPC pour votre région. Crée la fiche document si elle manque encore.`,
      bullets: [
        "Colonnes obligatoires : matricule, diplome_type (BEPC), document_type",
        "Colonnes utiles : annee_session",
        "Duplicatas exclus de cet import",
        "Notification automatique après disponibilisation",
      ],
      templateUrl: "/templates/decc/import-disponibilisation.csv",
      demoFileHint: `${demoCsvBasePath}/import-disponibilisation-bepc.csv`,
      csvHeader: AVAILABILITY_IMPORT_CSV_HEADER,
    },
  };
}

export function isObcAdmin(user: Pick<AuthenticatedUser, "organismeId">) {
  return user.organismeId === ORGANISME_IDS.OBC;
}

export function isDeccAdmin(user: Pick<AuthenticatedUser, "organismeId">) {
  return user.organismeId === ORGANISME_IDS.DECC;
}
