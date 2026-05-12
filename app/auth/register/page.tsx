import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex justify-center">
      <AuthCard
        title="Activer mon compte"
        description="Votre matricule et votre email doivent deja exister dans la base OBC."
      >
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
