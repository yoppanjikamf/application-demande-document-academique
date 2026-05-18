import { updateAdminQuotaAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminDisponibilitesPage() {
  const user = await requireRole("ADMINISTRATEUR", "/admin/rdv-disponibilites");
  const admin = await prisma.user.findUnique({
    where: { id: user.id },
    select: { maxRdvParJour: true },
  });
  const quota = admin?.maxRdvParJour ?? 10;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const rendezVous = await prisma.rendezVous.findMany({
    where: {
      adminId: user.id,
      dateRdv: { gte: monthStart, lte: monthEnd },
      statut: { not: "ANNULE" },
    },
  });

  const countByDay = new Map<string, number>();
  rendezVous.forEach((rdv) => {
    const key = rdv.dateRdv.toISOString().slice(0, 10);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Disponibilites RDV</h1>
        <p className="text-muted-foreground">Proposez des creneaux libres aux eleves.</p>
      </div>

      <form action={updateAdminQuotaAction} className="rounded-md border p-4 space-y-3">
        <Input
          name="maxRdvParJour"
          type="number"
          min={1}
          max={100}
          defaultValue={quota}
        />
        <Button type="submit">Mettre a jour le quota</Button>
      </form>

      <div className="space-y-3">
        {[...countByDay.entries()].map(([date, count]) => (
          <div key={date} className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">{date}</div>
            <div className="text-sm">Reservations: {count} / {quota}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
