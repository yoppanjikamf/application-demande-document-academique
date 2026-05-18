import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DocumentsPage() {
  const user = await requireRole("ELEVE", "/dashboard/documents");

  const documents = await prisma.documentAcademique.findMany({
    where: { eleveId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes documents</h1>
        <p className="text-muted-foreground">
          Liste de vos documents academiques sans date de creation.
        </p>
      </div>

      {documents.length === 0 ? (
        <p className="text-muted-foreground">Aucun document enregistre.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="text-lg font-semibold">{document.typeDocument}</p>
              <p className="mt-2 text-sm text-muted-foreground">Statut</p>
              <p className="text-sm">{document.statut}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
