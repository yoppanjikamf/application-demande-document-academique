import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/site-header";

export default function ObcLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12">
        <AuthCard
          title="Connexion admin OBC"
          description="Accès réservé aux administrateurs OBC qui gèrent le Baccalauréat et le Probatoire."
        >
          <Suspense fallback={null}>
            <LoginForm loginOrganisme="OBC" />
          </Suspense>
        </AuthCard>
      </main>
    </div>
  );
}
