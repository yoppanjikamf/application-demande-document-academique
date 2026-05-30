import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SiteHeader } from "@/components/site-header";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    email?: string;
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12">
        <AuthCard
          title="Nouveau mot de passe"
          description="Définissez un mot de passe robuste pour reprendre accès à votre compte."
        >
          <ResetPasswordForm email={params?.email} token={params?.token} />
        </AuthCard>
      </main>
    </div>
  );
}
