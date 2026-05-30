import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { SiteHeader } from "@/components/site-header";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12">
        <AuthCard
          title="Activer mon compte"
          description="Votre matricule et votre email doivent déjà exister dans la base DR-DOCSCOL."
        >
          <RegisterForm />
        </AuthCard>
      </main>
    </div>
  );
}
