"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface-1 px-4 text-center">
      <h1 className="font-display text-2xl text-text-1">Une erreur est survenue</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-text-3">
        La page n&apos;a pas pu s&apos;afficher. Réessayez ou retournez à l&apos;accueil.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => reset()}>
          Réessayer
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Accueil</Link>
        </Button>
      </div>
    </div>
  );
}
