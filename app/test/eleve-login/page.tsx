import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function EleveLoginTestPage() {
  return (
    <div className="flex justify-center">
      <AuthCard
        title="Test connexion eleve"
        description="Utilisez un compte eleve pour verifier la connexion."
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
