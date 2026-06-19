"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h1>Erreur DR-DOCSCOL</h1>
        <p style={{ marginTop: "1rem", color: "#555" }}>
          {error.message || "Impossible de charger l'application."}
        </p>
        <p style={{ marginTop: "1.5rem" }}>
          <button type="button" onClick={() => reset()} style={{ marginRight: "0.75rem" }}>
            Réessayer
          </button>
          <Link href="/">Accueil</Link>
        </p>
      </body>
    </html>
  );
}
