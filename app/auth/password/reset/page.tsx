import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    email?: string;
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Nouveau mot de passe"
      description="Définissez un mot de passe robuste pour reprendre accès à votre compte."
    >
      <ResetPasswordForm email={params?.email} token={params?.token} />
    </AuthShell>
  );
}
