import { handleApiError, json, parseJson } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { passwordResetSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, passwordResetSchema);

    // Récupérer le client Supabase
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return json({ error: "Configuration Supabase manquante." }, 503);
    }

    let authUserId: string;

    if (input.email && input.token) {
      // Vérifier le token de reset password en utilisant verifyOtp
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        type: "recovery",
        token: input.token,
        email: input.email,
      });

      if (verifyError || !data.user) {
        console.error("Supabase verify error:", verifyError);
        return json(
          {
            error: "Le lien de reset a expiré ou est invalide. Veuillez demander un nouveau lien.",
          },
          400,
        );
      }

      authUserId = data.user.id;
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return json(
          {
            error:
              "Session de réinitialisation introuvable. Ouvrez le lien reçu par email avant de changer le mot de passe.",
          },
          401,
        );
      }

      authUserId = user.id;
    }

    // Mettre à jour le mot de passe avec Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      password: input.newPassword,
    });

    if (updateError) {
      console.error("Supabase password update error:", updateError);
      return json(
        { error: "Impossible de mettre à jour le mot de passe. Veuillez réessayer." },
        500,
      );
    }

    // Récupérer l'utilisateur pour créer un log d'audit
    const dbUser = await prisma.user.findUnique({
      where: { authUserId },
      select: { id: true, email: true },
    });

    if (dbUser) {
      // Créer un log d'audit
      await prisma.auditLog
        .create({
          data: {
            action: "PASSWORD_RESET_COMPLETED",
            resource: "USER",
            resourceId: dbUser.id,
            userId: dbUser.id,
            details: JSON.stringify({ email: dbUser.email }),
          },
        })
        .catch((err) => {
          console.error("Failed to create audit log:", err);
        });
    }

    return json({
      ok: true,
      message:
        "Mot de passe réinitialisé avec succès. Connectez-vous avec votre nouveau mot de passe.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
