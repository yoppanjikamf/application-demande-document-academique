"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { reserverDisponibiliteAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Slot = {
  value: string;
  label: string;
  remaining: number;
  disabled: boolean;
};

type AppointmentDialogProps = {
  documentId: string;
  documentTitle: string;
  disabled: boolean;
  defaultComment?: string;
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function tomorrowKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatDateKey(date);
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function nextWeekdayKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);

  while (isWeekend(date)) {
    date.setDate(date.getDate() + 1);
  }

  return formatDateKey(date);
}

function startOfMonthFromKey(value: string) {
  const date = parseDateKey(value) ?? new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getWeekdayDates(month: Date, minDateKey: string) {
  const days: Date[] = [];
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const key = formatDateKey(date);
    if (!isWeekend(date) && key >= minDateKey) {
      days.push(date);
    }
  }

  return days;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function AppointmentDialog({
  documentId,
  documentTitle,
  disabled,
  defaultComment,
}: AppointmentDialogProps) {
  const initialDate = useMemo(() => nextWeekdayKey(), []);
  const [date, setDate] = useState(initialDate);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonthFromKey(initialDate));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const minDate = useMemo(() => tomorrowKey(), []);
  const minMonth = useMemo(() => monthKey(startOfMonthFromKey(initialDate)), [initialDate]);
  const weekdayDates = useMemo(() => getWeekdayDates(monthCursor, minDate), [minDate, monthCursor]);

  const moveMonth = (step: number) => {
    setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + step, 1));
  };

  useEffect(() => {
    const visibleDateKeys = weekdayDates.map((weekdayDate) => formatDateKey(weekdayDate));
    if (visibleDateKeys.length > 0 && !visibleDateKeys.includes(date)) {
      setDate(visibleDateKeys[0]);
    }
  }, [date, weekdayDates]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/appointments/slots?documentId=${encodeURIComponent(documentId)}&date=${date}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Impossible de charger les créneaux.");
        }
        return response.json() as Promise<{ date?: string; slots: Slot[] }>;
      })
      .then((payload) => {
        setSlots(payload.slots);
        setSelectedSlot(payload.slots.find((slot) => !slot.disabled)?.value ?? "");
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Erreur inconnue.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [date, disabled, documentId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="sm">
          <CalendarDays />
          Rendez-vous
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rendez-vous de retrait</DialogTitle>
          <DialogDescription>{documentTitle}</DialogDescription>
        </DialogHeader>

        <form action={reserverDisponibiliteAction} className="space-y-4">
          <input type="hidden" name="documentId" value={documentId} />
          <input type="hidden" name="dateRdv" value={date} />
          <input type="hidden" name="heureRdv" value={selectedSlot} />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-xs text-muted-foreground">
                  Les rendez-vous sont disponibles à partir du lendemain.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Mois précédent"
                  disabled={monthKey(monthCursor) <= minMonth}
                  onClick={() => moveMonth(-1)}
                >
                  <ChevronLeft />
                </Button>
                <p className="min-w-32 text-center text-sm font-medium capitalize">
                  {formatMonthLabel(monthCursor)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Mois suivant"
                  onClick={() => moveMonth(1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {weekdayDates.map((weekdayDate) => {
                const key = formatDateKey(weekdayDate);
                const isSelected = key === date;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDate(key)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      isSelected ? "border-foreground bg-accent" : "border-border hover:bg-accent"
                    }`}
                  >
                    <span className="block font-medium">
                      {weekdayDate.toLocaleDateString("fr-FR", { weekday: "short" })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {weekdayDate.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
            {weekdayDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun jour ouvrable disponible pour ce mois.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Créneau horaire</p>
            {loading ? <p className="text-sm text-muted-foreground">Chargement...</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="grid gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  disabled={slot.disabled}
                  onClick={() => setSelectedSlot(slot.value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${
                    selectedSlot === slot.value ? "border-foreground bg-accent" : "border-border"
                  }`}
                >
                  <span className="block font-medium">{slot.label}</span>
                  <span className="text-xs text-muted-foreground">{slot.remaining} places</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            name="commentaire"
            placeholder="Commentaire (optionnel)"
            defaultValue={defaultComment}
          />

          <DialogFooter>
            <Button type="submit" disabled={!selectedSlot || loading}>
              OK
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
