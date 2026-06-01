import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/site-header";

export default function DeccLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12">
        <AuthCard
          title="Connexion admin DECC"
          description="Accès réservé aux administrateurs DECC qui gèrent les demandes BEPC de leur région."
        >
          <Suspense fallback={null}>
            <LoginForm loginOrganisme="DECC" />
          </Suspense>
        </AuthCard>
      </main>
    </div>
  );
}
