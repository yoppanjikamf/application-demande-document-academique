import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12">
        <AuthCard title="Connexion" description="Connectez-vous avec votre matricule, email et mot de passe.">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </AuthCard>
      </main>
    </div>
  );
}
