"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import { PendingNavigationForm } from "@/components/ui/action-loading-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminStudentsSearchFormProps = {
  defaultQuery?: string;
};

export function AdminStudentsSearchForm({ defaultQuery }: AdminStudentsSearchFormProps) {
  const q = defaultQuery?.trim();

  return (
    <PendingNavigationForm
      className="rounded-md border border-[var(--border-token)] bg-surface-0 p-4 shadow-card"
      pendingTitle="Recherche en cours"
      pendingDescription="Nous récupérons les élèves correspondant à votre recherche."
      buildHref={(formData) => {
        const query = String(formData.get("q") ?? "").trim();
        return query ? `/admin/students?q=${encodeURIComponent(query)}` : "/admin/students";
      }}
    >
      <label htmlFor="admin-student-search" className="text-sm font-medium text-text-1">
        Recherche élève
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            id="admin-student-search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Matricule, nom, prénom ou email"
            className="pl-9"
          />
        </div>
        <Button type="submit">Rechercher</Button>
        {q ? (
          <Button asChild variant="outline">
            <Link href="/admin/students">Réinitialiser</Link>
          </Button>
        ) : null}
      </div>
    </PendingNavigationForm>
  );
}
