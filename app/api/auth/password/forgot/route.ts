import { getAppBaseUrl } from "@/lib/site-url";
import { handleApiError, json, parseJson } from "@/lib/api-utils";
import { enforceRateLimit } from "@/lib/rate-limit";
import { renderBrandedEmail } from "@/lib/email-template";
import { sendTrackedMail } from "@/lib/mail-service";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { passwordForgotSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(request, "auth-forgot", { maxRequests: 8 });
    if (limited.response) {
      return limited.response;
    }

    const input = await parseJson(request, passwordForgotSchema);

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, nom: true, prenom: true },
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
      return json({ ok: true, message: "Si l'email existe, un lien de reset a été envoyé." });
    }

    // Demander à Supabase d'envoyer un lien de reset password
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return json({ error: "Configuration Supabase manquante." }, 503);
    }

    const appUrl = getAppBaseUrl(new URL(request.url).origin);
    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${appUrl}/auth/callback?next=/auth/password/reset`,
    });

    if (error) {
      console.error("Supabase password reset error:", error);
      return json(
        { error: "Impossible d'envoyer le lien de reset. Veuillez réessayer plus tard." },
        500,
      );
    }

    // Créer un log d'audit
    await prisma.auditLog
      .create({
        data: {
          action: "PASSWORD_RESET_REQUESTED",
          resource: "USER",
          resourceId: user.id,
          userId: user.id,
          details: JSON.stringify({ email: user.email }),
        },
      })
      .catch((err) => {
        console.error("Failed to create audit log:", err);
      });

    // Envoyer un email de confirmation (optionnel, Supabase en envoie déjà un)
    await sendTrackedMail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      text: `Bonjour ${user.prenom},\n\nVous avez demandé une réinitialisation de mot de passe. Si ce n'est pas vous, ignorez cet email.\n\nSuivez le lien Supabase reçu pour réinitialiser votre mot de passe.`,
      html: renderBrandedEmail({
        title: "Réinitialisation de mot de passe",
        eyebrow: "Sécurité du compte",
        intro: `Bonjour ${user.prenom}, nous avons reçu une demande de réinitialisation pour votre compte.`,
        body: [
          "Un email Supabase séparé contient le lien sécurisé permettant de définir un nouveau mot de passe.",
          "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.",
        ],
        details: [{ label: "Compte concerné", value: user.email }],
        tone: "warning",
      }),
      userId: user.id,
    }).catch((err) => {
      console.error("Failed to send tracked mail:", err);
    });

    return json({
      ok: true,
      message: "Si l'email existe, un lien de reset a été envoyé.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
