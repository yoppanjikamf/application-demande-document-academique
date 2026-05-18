import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginTestPage() {
  return (
    <div className="flex justify-center">
      <AuthCard
        title="Test connexion admin"
        description="Utilisez les identifiants admin pour verifier la connexion."
      >
        <LoginForm />
      </AuthCard>
    </div>
  );
}
