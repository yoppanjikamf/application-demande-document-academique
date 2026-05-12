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
