import { z } from "zod";

export const signInSchema = z.object({
  matricule: z.string().trim().min(2, "Le matricule est obligatoire.").max(32),
  email: z.string().trim().toLowerCase().email("Veuillez entrer une adresse email valide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres."),
});

export const signUpSchema = signInSchema.extend({
  confirmPassword: z.string().min(8, "Veuillez confirmer le mot de passe."),
}).refine((value) => value.password === value.confirmPassword, {
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
  dateRdv: z.string().trim().min(8, "La date est obligatoire."),
  heureRdv: z.string().trim().min(4, "L'heure est obligatoire."),
  commentaire: z.string().trim().max(250).optional(),
});

export const adminQuotaSchema = z.object({
  maxRdvParJour: z.coerce.number().int().min(1).max(100),
});
