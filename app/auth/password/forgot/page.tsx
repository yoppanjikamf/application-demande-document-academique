import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { SiteHeader } from "@/components/site-header";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12">
        <AuthCard
          title="Mot de passe oublié"
          description="Recevez un lien sécurisé pour définir un nouveau mot de passe."
        >
          <ForgotPasswordForm />
        </AuthCard>
      </main>
    </div>
  );
}
