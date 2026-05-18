import { reserverDisponibiliteAction, annulerRendezVousAction } from "@/app/dashboard/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_DAILY_QUOTA = 10;
const DEFAULT_LIEU = "Service OBC";
const SLOT_MINUTES = 30;
const MORNING_START = "08:00";
const MORNING_END = "12:00";
const AFTERNOON_START = "14:00";
const AFTERNOON_END = "16:00";

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseTime(value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return { hours, minutes };
}

function buildSlots(start: string, end: string) {
  const slots: string[] = [];
  const startTime = parseTime(start);
  const endTime = parseTime(end);
  const cursor = new Date(2000, 0, 1, startTime.hours, startTime.minutes);
  const limit = new Date(2000, 0, 1, endTime.hours, endTime.minutes);

  while (cursor < limit) {
    const hours = String(cursor.getHours()).padStart(2, "0");
    const minutes = String(cursor.getMinutes()).padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    cursor.setMinutes(cursor.getMinutes() + SLOT_MINUTES);
  }

  return slots;
}

function buildCalendarDays(current: Date) {
  const days: Date[] = [];
  const start = new Date(current.getFullYear(), current.getMonth(), 1);
  const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);

  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(new Date(current.getFullYear(), current.getMonth(), day));
  }

  return { start, days };
}

type RendezVousPageProps = {
  searchParams?: { date?: string };
};

export default async function RendezVousPage({ searchParams }: RendezVousPageProps) {
  const user = await requireRole("ELEVE", "/dashboard/rendezvous");

  const today = new Date();
  const rawSelected = searchParams?.date ? new Date(searchParams.date) : today;
  const selectedDate = Number.isNaN(rawSelected.getTime()) ? today : rawSelected;
  const selectedKey = formatDateKey(selectedDate);

  const [admins, rendezVous] = await Promise.all([
    prisma.user.findMany({
      where: { role: "ADMINISTRATEUR" },
      select: { id: true, maxRdvParJour: true },
    }),
    prisma.rendezVous.findMany({
      where: { eleveId: user.id },
      orderBy: { dateRdv: "desc" },
      include: { admin: true },
    }),
  ]);

  const month = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
  const allRdv = await prisma.rendezVous.findMany({
    where: {
      dateRdv: { gte: monthStart, lte: monthEnd },
      statut: { not: "ANNULE" },
    },
    select: { adminId: true, dateRdv: true },
  });

  const countsByAdminDay = new Map<string, number>();
  allRdv.forEach((rdv) => {
    const key = `${rdv.adminId}:${formatDateKey(rdv.dateRdv)}`;
    countsByAdminDay.set(key, (countsByAdminDay.get(key) ?? 0) + 1);
  });

  const { start, days } = buildCalendarDays(selectedDate);
  const startDay = (start.getDay() + 6) % 7;
  const slots = [...buildSlots(MORNING_START, MORNING_END), ...buildSlots(AFTERNOON_START, AFTERNOON_END)];

  const hasCapacity = (date: Date) => {
    if (isWeekend(date)) {
      return false;
    }

    const key = formatDateKey(date);
    return admins.some((admin) => {
      const quota = admin.maxRdvParJour ?? DEFAULT_DAILY_QUOTA;
      const count = countsByAdminDay.get(`${admin.id}:${key}`) ?? 0;
      return count < quota;
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rendez-vous</h1>
        <p className="text-muted-foreground">
          Choisissez un creneau pour le retrait physique de vos documents.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Calendrier des retraits</h2>
        <div className="grid grid-cols-7 gap-2 text-sm">
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
            {days.map((date) => {
            const key = formatDateKey(date);
            const available = hasCapacity(date);
            const isSelected = key === selectedKey;
              const disabled = !available;
            return (
                <span
                key={key}
                className={`rounded-md border px-2 py-2 text-center ${
                  available ? "bg-white" : "bg-muted text-muted-foreground line-through"
                } ${isSelected ? "border-foreground" : "border-border"}`}
              >
                  {available ? (
                    <a className="block" href={`/dashboard/rendezvous?date=${key}`}>
                      {date.getDate()}
                    </a>
                  ) : (
                    <span>{date.getDate()}</span>
                  )}
                </span>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Jours barres = quota admin atteint ou week-end.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Choisir un horaire</h2>
        {hasCapacity(selectedDate) ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((time) => (
              <form
                key={time}
                action={reserverDisponibiliteAction}
                className="rounded-md border p-3 space-y-2"
              >
                <input type="hidden" name="dateRdv" value={selectedKey} />
                <input type="hidden" name="heureRdv" value={time} />
                <div className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString("fr-FR")} • {time} • {DEFAULT_LIEU}
                </div>
                <Input name="commentaire" placeholder="Commentaire (optionnel)" />
                <Button type="submit">Reserver</Button>
              </form>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Jour complet. Choisissez un autre jour.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Mes retraits (rendez-vous)</h2>
        {rendezVous.length === 0 ? (
          <p className="text-muted-foreground">Aucun rendez-vous planifie.</p>
        ) : (
          <div className="space-y-3">
            {rendezVous.map((rdv) => (
              <div key={rdv.id} className="rounded-md border p-4 space-y-2">
                <div className="text-sm text-muted-foreground">
                  {rdv.dateRdv.toLocaleDateString("fr-FR")} • {rdv.heureRdv} • {rdv.lieu}
                </div>
                <div className="text-xs text-muted-foreground">
                  Admin: {rdv.admin.prenom} {rdv.admin.nom}
                </div>
                <div className="text-sm">Statut: {rdv.statut}</div>
                <div className="text-sm text-muted-foreground">Commentaire: {rdv.commentaire}</div>
                {rdv.statut !== "ANNULE" ? (
                  <form action={annulerRendezVousAction}>
                    <input type="hidden" name="rendezVousId" value={rdv.id} />
                    <Button type="submit" variant="outline">Annuler</Button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
