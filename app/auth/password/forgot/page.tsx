import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      description="Recevez un lien sécurisé pour définir un nouveau mot de passe."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
