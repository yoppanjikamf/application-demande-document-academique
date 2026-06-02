import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function AgentCentreExamenLoginPage() {
  return (
    <AuthShell
      title="Connexion agent centre"
      description="Accès réservé aux agents qui confirment les retraits physiques."
    >
      <Suspense fallback={null}>
        <LoginForm loginRole="AGENT_CENTRE_EXAMEN" />
      </Suspense>
    </AuthShell>
  );
}
