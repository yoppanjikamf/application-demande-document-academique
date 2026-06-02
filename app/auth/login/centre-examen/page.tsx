import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/site-header";

export default function AgentCentreExamenLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12">
        <AuthCard
          title="Connexion Agent Centre d'Examen"
          description="Accès réservé aux agents qui confirment les retraits effectués dans leur centre d'examen."
        >
          <Suspense fallback={null}>
            <LoginForm loginRole="AGENT_CENTRE_EXAMEN" />
          </Suspense>
        </AuthCard>
      </main>
    </div>
  );
}
