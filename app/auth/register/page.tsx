import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      portal="register"
      title="Activer mon compte"
      description="Votre matricule et votre email doivent déjà exister dans la base OBC/DECC."
    >
      <RegisterForm />
    </AuthShell>
  );
}
