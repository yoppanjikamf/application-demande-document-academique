"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";

import { useI18n } from "@/components/i18n/locale-provider";
import type { TranslationKey } from "@/lib/i18n/translate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConsultationDocument = {
  title: string;
  statut: string;
  statutLabel: string;
};

type ConsultationResponse =
  | { found: false }
  | { found: true; activated: false; prenom: string }
  | { found: true; activated: true; prenom: string; documents: ConsultationDocument[] };

function statusTone(statut: string) {
  if (statut === "DISPONIBLE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  if (statut === "RETIRE") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }
  if (statut === "PENDING") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function getStatusLabel(t: (key: TranslationKey) => string, statut: string) {
  const key = `documentStatus.${statut}` as TranslationKey;
  const translated = t(key);
  return translated === key ? statut : translated;
}

export function ConsultationPanel() {
  const { t } = useI18n();
  const [matricule, setMatricule] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConsultationResponse | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/public/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule: matricule.trim() }),
      });

      const payload = (await response.json()) as ConsultationResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? t("consultation.errorDefault"));
      }

      setResult(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : t("consultation.errorDefault"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-obc-100 text-obc-800">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-2xl text-text-1">{t("consultation.title")}</h1>
            <p className="mt-2 text-sm leading-6 text-text-3">{t("consultation.description")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="consultation-matricule" className="text-sm font-medium text-text-1">
              {t("consultation.matriculeLabel")}
            </label>
            <Input
              id="consultation-matricule"
              name="matricule"
              value={matricule}
              onChange={(event) => setMatricule(event.target.value.toUpperCase())}
              placeholder={t("consultation.matriculePlaceholder")}
              className="mt-2"
              autoComplete="off"
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            <Search className="h-4 w-4" />
            {loading ? t("consultation.searching") : t("consultation.submit")}
          </Button>
        </form>
      </div>

      {result?.found === false ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t("consultation.notFound")}
        </div>
      ) : null}

      {result?.found && result.activated === false ? (
        <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="text-sm leading-6 text-amber-900">
            {t("consultation.notActivated").replace("{prenom}", result.prenom)}
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/auth/register">
              {t("common.activateAccount")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}

      {result?.found && result.activated ? (
        <div className="space-y-4 rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card sm:p-6">
          <p className="text-sm text-text-3">
            {t("consultation.greeting")}{" "}
            <span className="font-semibold text-text-1">{result.prenom}</span>,{" "}
            {t("consultation.statusIntro")}
          </p>

          {result.documents.length === 0 ? (
            <p className="text-sm text-text-3">{t("consultation.noExams")}</p>
          ) : (
            <ul className="space-y-3">
              {result.documents.map((document) => (
                <li
                  key={document.title}
                  className={`rounded-md border px-4 py-3 ${statusTone(document.statut)}`}
                >
                  <p className="font-medium">{document.title}</p>
                  <p className="mt-1 text-sm">{getStatusLabel(t, document.statut)}</p>
                </li>
              ))}
            </ul>
          )}

          <p className="text-sm leading-6 text-text-3">{t("consultation.nextStepsActivated")}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/auth/login">
                {t("consultation.connect")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard/documents">{t("consultation.openDashboard")}</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
