"use client";

import type { ComponentProps } from "react";

import { useI18n } from "@/components/i18n/locale-provider";
import { Input } from "@/components/ui/input";
import { SelectValue } from "@/components/ui/select";
import type { TranslationKey } from "@/lib/i18n/translate";

export function T({
  k,
  vars,
}: {
  k: TranslationKey;
  vars?: Record<string, string | number>;
}) {
  const { t } = useI18n();
  return <>{t(k, vars)}</>;
}

export function useLocaleTag() {
  const { locale } = useI18n();
  return locale === "en" ? "en-GB" : "fr-FR";
}

export function formatLocaleDate(value: Date | string, localeTag: string) {
  return new Date(value).toLocaleDateString(localeTag);
}

export function formatLocaleDateTime(value: Date | string, localeTag: string) {
  return new Date(value).toLocaleString(localeTag);
}

export function LocaleDate({
  value,
  dateTime = false,
}: {
  value: Date | string;
  dateTime?: boolean;
}) {
  const localeTag = useLocaleTag();
  return <>{dateTime ? formatLocaleDateTime(value, localeTag) : formatLocaleDate(value, localeTag)}</>;
}

export function DocumentTitleText({
  diplomeType,
  typeDocument,
}: {
  diplomeType: string;
  typeDocument: "ORIGINAL" | "RELEVE_NOTES" | "DUPLICATA" | string;
}) {
  const { t } = useI18n();
  const diplomeKey = `dashboard.diplomaName.${diplomeType}` as TranslationKey;
  const diplome = t(diplomeKey);
  const titleKey =
    typeDocument === "ORIGINAL"
      ? "dashboard.diplomaTitle.ORIGINAL"
      : typeDocument === "RELEVE_NOTES"
        ? "dashboard.diplomaTitle.RELEVE_NOTES"
        : "dashboard.diplomaTitle.DUPLICATA";
  return <>{t(titleKey, { diplome: diplome === diplomeKey ? diplomeType : diplome })}</>;
}

export function DocumentStatusText({
  requested,
  statut,
}: {
  requested: boolean;
  statut?: string | null;
}) {
  const { t } = useI18n();
  if (!requested) {
    return <>{t("documentStatus.PENDING")}</>;
  }
  const key = `documentStatus.${statut ?? "PAS_DISPONIBLE"}` as TranslationKey;
  const label = t(key);
  return <>{label === key ? statut : label}</>;
}

export function AppointmentStatusText({ statut }: { statut: string }) {
  const { t } = useI18n();
  const key = `dashboard.appointments.${statut}` as TranslationKey;
  const label = t(key);
  return <>{label === key ? statut : label}</>;
}

export function PaymentStatusText({ statut }: { statut: string }) {
  const { t } = useI18n();
  const key = `dashboard.payments.${statut}` as TranslationKey;
  const label = t(key);
  return <>{label === key ? statut : label}</>;
}

export function PaymentModeText({ mode }: { mode: string }) {
  const { t } = useI18n();
  const key = `dashboard.payments.${mode}` as TranslationKey;
  const label = t(key);
  return <>{label === key ? mode : label}</>;
}

export function useDiplomaName(type: string) {
  const { t } = useI18n();
  const key = `dashboard.diplomaName.${type}` as TranslationKey;
  const label = t(key);
  return label === key ? type : label;
}

export function DiplomaName({ type }: { type: string }) {
  return <>{useDiplomaName(type)}</>;
}

export function TDiploma({ k, type }: { k: TranslationKey; type: string }) {
  const { t } = useI18n();
  return <>{t(k, { diplome: useDiplomaName(type) })}</>;
}

export function PickupAt({ place }: { place?: string | null }) {
  const { t } = useI18n();
  return <>{t("dashboard.documents.pickupAt", { place: place || t("dashboard.documents.pickupCentre") })}</>;
}

export function NextRequestNotice({ date }: { date: Date | string }) {
  const { t } = useI18n();
  const localeTag = useLocaleTag();
  return <>{t("dashboard.documents.nextRequestOn", { date: formatLocaleDate(date, localeTag) })}</>;
}

export function DiplomaValueInput({
  type,
  ...props
}: { type: string } & Omit<ComponentProps<typeof Input>, "value">) {
  const value = useDiplomaName(type);
  return <Input {...props} value={value} />;
}

export function TPlaceholderInput({
  k,
  ...props
}: { k: TranslationKey } & Omit<ComponentProps<typeof Input>, "placeholder">) {
  const { t } = useI18n();
  return <Input {...props} placeholder={t(k)} />;
}

export function TAria({
  k,
  ...props
}: { k: TranslationKey } & ComponentProps<typeof Input>) {
  const { t } = useI18n();
  return <Input {...props} aria-label={t(k)} />;
}

export function TPlaceholderTextarea({
  k,
  className,
  ...props
}: { k: TranslationKey } & ComponentProps<"textarea">) {
  const { t } = useI18n();
  return (
    <textarea
      {...props}
      placeholder={t(k)}
      className={
        className ??
        "min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-card outline-none focus-visible:ring-1 focus-visible:ring-ring"
      }
    />
  );
}

export function TSelectValue({ k }: { k: TranslationKey }) {
  const { t } = useI18n();
  return <SelectValue placeholder={t(k)} />;
}

export function AdminRdvLine({ date, time }: { date: Date | string; time: string }) {
  const { t } = useI18n();
  const localeTag = useLocaleTag();
  return <>{t("dashboard.admin.rdvLine", { date: formatLocaleDate(date, localeTag), time })}</>;
}

export function DocumentStatusOption({
  status,
  value,
}: {
  status: string;
  value: string;
}) {
  const { t } = useI18n();
  const key = `documentStatus.${status}` as TranslationKey;
  const label = t(key);
  return <option value={value}>{label === key ? status : label}</option>;
}

export function AppointmentBookedNotice({
  date,
  time,
}: {
  date: Date | string;
  time: string;
}) {
  const { t } = useI18n();
  const localeTag = useLocaleTag();
  return (
    <div className="rounded-md bg-obc-100 p-3 text-sm text-obc-800">
      {t("dashboard.documents.appointmentOn", {
        date: formatLocaleDate(date, localeTag),
        time,
      })}
    </div>
  );
}

export function RetiredSummary({
  date,
  labelKey,
}: {
  date?: Date | string | null;
  labelKey: TranslationKey;
}) {
  const { t } = useI18n();
  const localeTag = useLocaleTag();
  const dateSuffix = date
    ? t("dashboard.documents.alreadyWithdrawnOn", { date: formatLocaleDate(date, localeTag) })
    : "";
  return (
    <div className="rounded-md bg-obc-100 p-3 text-sm text-obc-800">
      {t("dashboard.documents.alreadyWithdrawn", { label: t(labelKey), date: dateSuffix })}
    </div>
  );
}
