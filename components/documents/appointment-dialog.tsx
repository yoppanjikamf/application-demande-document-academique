"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { reserverDisponibiliteAction } from "@/app/dashboard/actions";
import { useI18n } from "@/components/i18n/locale-provider";
import { useDiplomaName, useLocaleTag } from "@/components/i18n/ui";
import type { TranslationKey } from "@/lib/i18n/translate";
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
  documentTitle?: string;
  documentTitleKey?: TranslationKey;
  diplomeType?: string;
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

export function AppointmentDialog({
  documentId,
  documentTitle,
  documentTitleKey,
  diplomeType,
  disabled,
  defaultComment,
}: AppointmentDialogProps) {
  const { t } = useI18n();
  const localeTag = useLocaleTag();
  const diplomeName = useDiplomaName(diplomeType ?? "");
  const resolvedTitle = documentTitleKey
    ? t(documentTitleKey, { diplome: diplomeName })
    : documentTitle ?? "";

  function formatMonthLabel(date: Date) {
    return date.toLocaleDateString(localeTag, { month: "long", year: "numeric" });
  }
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
          throw new Error(t("dashboard.booking.slotsError"));
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
        setError(
          fetchError instanceof Error ? fetchError.message : t("dashboard.booking.unknownError"),
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [date, disabled, documentId, t]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled} size="sm">
          <CalendarDays />
          {t("dashboard.booking.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dashboard.booking.title")}</DialogTitle>
          <DialogDescription>{resolvedTitle}</DialogDescription>
        </DialogHeader>

        <form action={reserverDisponibiliteAction} className="space-y-4">
          <input type="hidden" name="documentId" value={documentId} />
          <input type="hidden" name="dateRdv" value={date} />
          <input type="hidden" name="heureRdv" value={selectedSlot} />

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium">{t("dashboard.booking.date")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.booking.dateHint")}</p>
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("dashboard.booking.prevMonth")}
                  disabled={monthKey(monthCursor) <= minMonth}
                  onClick={() => moveMonth(-1)}
                >
                  <ChevronLeft />
                </Button>
                <p className="min-w-28 flex-1 text-center text-sm font-medium capitalize sm:min-w-32">
                  {formatMonthLabel(monthCursor)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("dashboard.booking.nextMonth")}
                  onClick={() => moveMonth(1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto overscroll-y-contain pr-1">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
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
                      {weekdayDate.toLocaleDateString(localeTag, { weekday: "short" })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {weekdayDate.toLocaleDateString(localeTag, {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </button>
                );
              })}
              </div>
            </div>
            {weekdayDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.booking.noWeekday")}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{t("dashboard.booking.slot")}</p>
            {loading ? (
              <p className="text-sm text-muted-foreground">{t("dashboard.booking.loading")}</p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                  <span className="text-xs text-muted-foreground">
                    {t("dashboard.booking.places", { count: slot.remaining })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Input
            name="commentaire"
            placeholder={t("dashboard.booking.comment")}
            defaultValue={defaultComment}
          />

          <DialogFooter className="sticky bottom-0 -mx-4 border-t border-[var(--border-token)] bg-surface-0 px-4 pb-1 pt-3 sm:-mx-6 sm:px-6">
            <Button type="submit" disabled={!selectedSlot || loading} className="w-full sm:w-auto">
              {t("dashboard.booking.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
