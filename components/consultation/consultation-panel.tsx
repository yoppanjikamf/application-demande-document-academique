"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConsultationDocument = {
  title: string;
  statut: string;
  statutLabel: string;
};

type ConsultationResponse =
  | { found: false }
  | { found: true; prenom: string; documents: ConsultationDocument[] };

function statusTone(statut: string) {
  if (statut === "DISPONIBLE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }
  if (statut === "RETIRE") {
    return "border-slate-200 bg-slate-50 text-slate-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-900";
}

export function ConsultationPanel() {
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
        throw new Error(payload.error ?? "Consultation impossible.");
      }

      setResult(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Erreur inconnue.");
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
            <h1 className="font-display text-2xl text-text-1">Consultation rapide</h1>
            <p className="mt-2 text-sm leading-6 text-text-3">
              Saisissez votre matricule pour connaître la disponibilité de vos documents scolaires.
              Aucun compte n&apos;est créé automatiquement.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="consultation-matricule" className="text-sm font-medium text-text-1">
              Matricule élève
            </label>
            <Input
              id="consultation-matricule"
              name="matricule"
              value={matricule}
              onChange={(event) => setMatricule(event.target.value.toUpperCase())}
              placeholder="Ex. ELEVE0002"
              className="mt-2"
              autoComplete="off"
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            <Search className="h-4 w-4" />
            {loading ? "Recherche..." : "Consulter la disponibilité"}
          </Button>
        </form>
      </div>

      {result?.found === false ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Aucun élève trouvé pour ce matricule. Vérifiez la saisie ou contactez votre organisme si
          vous venez d&apos;être enregistré.
        </div>
      ) : null}

      {result?.found ? (
        <div className="space-y-4 rounded-lg border border-[var(--border-token)] bg-surface-0 p-5 shadow-card sm:p-6">
          <p className="text-sm text-text-3">
            Bonjour <span className="font-semibold text-text-1">{result.prenom}</span>, voici le
            statut de vos documents :
          </p>

          {result.documents.length === 0 ? (
            <p className="text-sm text-text-3">Aucun document scolaire enregistré pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {result.documents.map((document) => (
                <li
                  key={document.title}
                  className={`rounded-md border px-4 py-3 ${statusTone(document.statut)}`}
                >
                  <p className="font-medium">{document.title}</p>
                  <p className="mt-1 text-sm">{document.statutLabel}</p>
                </li>
              ))}
            </ul>
          )}

          <p className="text-sm leading-6 text-text-3">
            Pour demander un document, payer un duplicata ou prendre un rendez-vous de retrait,
            activez votre compte ou connectez-vous.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/auth/register">
                Activer mon compte
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/auth/login">Me connecter</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
