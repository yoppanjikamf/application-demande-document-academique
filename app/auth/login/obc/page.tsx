import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function ObcLoginPage() {
  return (
    <AuthShell
      title="Connexion admin OBC"
      description="Accès réservé aux administrateurs OBC habilités."
    >
      <Suspense fallback={null}>
        <LoginForm loginOrganisme="OBC" />
      </Suspense>
    </AuthShell>
  );
}
