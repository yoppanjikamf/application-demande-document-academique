import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function DeccLoginPage() {
  return (
    <AuthShell
      title="Connexion admin DECC"
      description="Accès réservé aux administrateurs DECC habilités."
    >
      <Suspense fallback={null}>
        <LoginForm loginOrganisme="DECC" />
      </Suspense>
    </AuthShell>
  );
}
