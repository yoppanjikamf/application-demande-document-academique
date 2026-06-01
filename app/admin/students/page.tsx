import { Mail, Search } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { getAdminDocumentScope, getAntenneById } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Input } from "@/components/ui/input";

type AdminStudentsPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function AdminStudentsPage({ searchParams }: AdminStudentsPageProps) {
  const user = await requireRole("ADMINISTRATEUR", "/admin/students");
  const params = await searchParams;
  const q = params?.q?.trim();
  const documentScope = getAdminDocumentScope(user);
  const regionLabel = getAntenneById(user.antenneRegionaleId)?.region ?? undefined;
  const where = {
    role: "ELEVE" as const,
    documentsAcademique: { some: documentScope },
    ...(q
      ? {
          OR: [
            { matricule: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { nom: { contains: q, mode: "insensitive" as const } },
            { prenom: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const students = await prisma.user.findMany({
    where,
    take: 50,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      matricule: true,
      email: true,
      nom: true,
      prenom: true,
      dateNaissance: true,
      _count: {
        select: {
          documentsAcademique: { where: documentScope },
          eleveRendezVous: { where: { document: { is: documentScope } } },
        },
      },
    },
  });

  return (
    <DashboardShell
      role="ADMINISTRATEUR"
      userName={`${user.prenom} ${user.nom}`}
      scopeLabel={regionLabel}
      activePath="/admin/students"
      title="Élèves"
      subtitle="Recherche et suivi des comptes élèves rattachés aux documents académiques."
    >
      <form className="max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={q ?? ""} placeholder="Matricule, nom ou email" className="pl-9" />
        </div>
      </form>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[1.2fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500">
          <span>Élève</span>
          <span className="hidden md:block">Contact</span>
          <span>Dossier</span>
        </div>
        <div className="divide-y divide-slate-100">
          {students.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">Aucun élève trouvé.</p>
          ) : (
            students.map((student) => (
              <div key={student.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
                <div>
                  <p className="font-medium text-slate-950">
                    {student.prenom} {student.nom}
                  </p>
                  <p className="text-sm text-slate-500">{student.matricule}</p>
                </div>
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </p>
                <p className="text-sm text-slate-600">
                  {student._count.documentsAcademique} documents · {student._count.eleveRendezVous} RDV
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
