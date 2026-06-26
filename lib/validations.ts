import { z } from "zod";

export const signInSchema = z.object({
  matricule: z.string().trim().min(2, "Le matricule est obligatoire.").max(32),
  email: z.string().trim().toLowerCase().email("Veuillez entrer une adresse email valide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
});

export const signUpSchema = signInSchema
  .extend({
    confirmPassword: z.string().min(8, "Veuillez confirmer le mot de passe."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "La date de naissance est invalide.",
  });

export const profileUpdateSchema = z.object({
  nom: z.string().trim().min(2, "Le nom est obligatoire.").max(120),
  prenom: z.string().trim().min(2, "Le prenom est obligatoire.").max(120),
  dateNaissance: optionalDateString,
  nomService: z.string().trim().max(120).optional(),
});

export const disponibiliteSchema = z.object({
  dateRdv: z.string().trim().min(8, "La date est obligatoire."),
  heureRdv: z.string().trim().min(4, "L'heure est obligatoire."),
  lieu: z.string().trim().min(2, "Le lieu est obligatoire.").max(160),
});

export const reservationSchema = z.object({
  documentId: z.string().trim().min(10, "Le document est obligatoire."),
  dateRdv: z.string().trim().min(8, "La date est obligatoire."),
  heureRdv: z.string().trim().min(4, "L'heure est obligatoire."),
  commentaire: z.string().trim().max(250).optional(),
});

export const adminQuotaSchema = z.object({
  quotaJournalier: z.coerce.number().int().min(1).max(1000),
});

export const documentStatusUpdateSchema = z.object({
  documentId: z.string().trim().min(10),
  statut: z.enum(["PAS_DISPONIBLE", "DISPONIBLE", "RETIRE"]),
});

export const adminManualStudentSchema = z.object({
  matricule: z.string().trim().min(2).max(32),
  email: z.string().trim().toLowerCase().email(),
  nom: z.string().trim().min(2).max(120),
  prenom: z.string().trim().min(2).max(120),
  dateNaissance: optionalDateString,
  diplomeType: z.enum(["BEPC", "PROBATOIRE", "BACCALAUREAT"]),
  anneeSession: z.coerce.number().int().min(1950).max(2100).optional(),
  centreExamen: z.string().trim().min(2).max(160),
  regionComposition: z.string().trim().min(2).max(80),
  documentType: z.enum(["ORIGINAL", "RELEVE_NOTES", "DUPLICATA"]).optional(),
  documentStatut: z.enum(["PAS_DISPONIBLE", "DISPONIBLE", "RETIRE"]).optional(),
});

export const passwordForgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Veuillez entrer une adresse email valide."),
});

export const passwordResetSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Veuillez entrer une adresse email valide.")
      .optional(),
    token: z.string().trim().min(10, "Le token est invalide.").optional(),
    newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
    confirmPassword: z.string().min(8, "Veuillez confirmer le mot de passe."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  })
  .refine(
    (value) => (!value.email && !value.token) || (Boolean(value.email) && Boolean(value.token)),
    {
      message: "Le token et l'email doivent etre fournis ensemble.",
      path: ["token"],
    },
  );
