"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminQuotaSchema } from "@/lib/validations";
import { Role, StatutDocument, StatutRendezVous, TypeDocument } from "@/lib/generated/prisma/client";

type CsvRow = Record<string, string>;

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((value) => value.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function normalize(value: string) {
  return value.trim();
}

function normalizeUpper(value: string) {
  return value.trim().toUpperCase();
}

async function findSupabaseUserIdByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const perPage = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw error;
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found) {
      return found.id;
    }

    if (data.users.length < perPage) {
      return null;
    }
  }

  throw new Error("Impossible de verifier tous les utilisateurs Supabase Auth.");
}

async function ensureSupabaseEleve(email: string, password: string, matricule: string) {
  const supabase = createSupabaseAdminClient();
  const existingUserId = await findSupabaseUserIdByEmail(email);
  const payload = {
    password,
    email_confirm: true,
    app_metadata: {
      role: Role.ELEVE,
      matricule,
    },
    user_metadata: {
      matricule,
    },
  };

  const { data, error } = existingUserId
    ? await supabase.auth.admin.updateUserById(existingUserId, payload)
    : await supabase.auth.admin.createUser({
        email,
        ...payload,
      });

  if (error) {
    throw error;
  }

  return data.user.id;
}

export async function updateAdminQuotaAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    return { ok: false as const, error: "Acces refuse." };
  }

  const parsed = adminQuotaSchema.safeParse({
    maxRdvParJour: formData.get("maxRdvParJour"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Quota invalide." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { maxRdvParJour: parsed.data.maxRdvParJour },
  });

  return { ok: true as const };
}

export async function importTestDataAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMINISTRATEUR") {
    return { ok: false as const, error: "Acces refuse." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, error: "Fichier CSV manquant." };
  }

  const content = await file.text();
  const rows = parseCsv(content);

  if (rows.length === 0) {
    return { ok: false as const, error: "CSV vide ou invalide." };
  }

  let createdUsers = 0;
  let createdDocuments = 0;
  let createdRendezVous = 0;

  for (const row of rows) {
    const matricule = normalizeUpper(row.eleve_matricule || "");
    const email = normalize(row.eleve_email || "").toLowerCase();
    const password = normalize(row.eleve_password || "");
    const nom = normalize(row.eleve_nom || "");
    const prenom = normalize(row.eleve_prenom || "");
    const dateNaissance = parseDate(row.eleve_date_naissance || "") ?? undefined;

    if (!matricule || !email || !password || !nom || !prenom) {
      throw new Error("Ligne CSV invalide: donnees eleve manquantes.");
    }

    const authUserId = await ensureSupabaseEleve(email, password, matricule);

    const eleve = await prisma.user.upsert({
      where: { matricule },
      update: {
        authUserId,
        email,
        nom,
        prenom,
        role: Role.ELEVE,
        nomService: null,
        dateNaissance: dateNaissance ?? null,
      },
      create: {
        authUserId,
        email,
        matricule,
        nom,
        prenom,
        role: Role.ELEVE,
        dateNaissance: dateNaissance ?? null,
      },
    });

    createdUsers += 1;

    const typeDocument = normalizeUpper(row.document_type || "");
    const statutDocument = normalizeUpper(row.document_statut || "EN_ATTENTE");

    if (typeDocument) {
      const type = TypeDocument[typeDocument as keyof typeof TypeDocument];
      const statut = StatutDocument[statutDocument as keyof typeof StatutDocument];

      if (!type || !statut) {
        throw new Error(`Type ou statut de document invalide pour ${matricule}.`);
      }

      await prisma.documentAcademique.create({
        data: {
          eleveId: eleve.id,
          typeDocument: type,
          statut,
        },
      });

      createdDocuments += 1;
    }

    const adminMatricule = normalizeUpper(row.admin_matricule || "");
    const rdvDate = parseDate(row.rdv_date || "");
    const rdvHeure = normalize(row.rdv_heure || "");
    const rdvLieu = normalize(row.rdv_lieu || "");
    const rdvStatutValue = normalizeUpper(row.rdv_statut || "PLANIFIE");

    if (adminMatricule && rdvDate && rdvHeure && rdvLieu) {
      const admin = await prisma.user.findUnique({ where: { matricule: adminMatricule } });
      if (!admin) {
        throw new Error(`Admin introuvable pour matricule ${adminMatricule}.`);
      }

      const rdvStatut = StatutRendezVous[rdvStatutValue as keyof typeof StatutRendezVous];
      if (!rdvStatut) {
        throw new Error(`Statut RDV invalide pour ${matricule}.`);
      }

      const commentaire = normalize(row.rdv_commentaire || "Import CSV");

      if (rdvStatut !== "ANNULE") {
        await prisma.rendezVous.create({
          data: {
            adminId: admin.id,
            eleveId: eleve.id,
            dateRdv: rdvDate,
            heureRdv: rdvHeure,
            lieu: rdvLieu,
            statut: rdvStatut,
            commentaire,
          },
        });

        createdRendezVous += 1;
      }
    }
  }

  return {
    ok: true as const,
    summary: {
      createdUsers,
      createdDocuments,
      createdRendezVous,
    },
  };
}
