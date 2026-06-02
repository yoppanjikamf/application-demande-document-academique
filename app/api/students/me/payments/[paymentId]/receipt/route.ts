import { NextResponse } from "next/server";

import { ApiError, handleApiError, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("ELEVE");
    const { paymentId } = await params;
    const url = new URL(request.url);
    const shouldDownload = url.searchParams.get("download") === "1";

    const payment = await prisma.paiement.findFirst({
      where: {
        id: paymentId,
        OR: [{ duplicata: { eleveId: user.id } }, { documentAcademique: { eleveId: user.id } }],
      },
      include: {
        duplicata: { include: { eleve: true } },
        documentAcademique: { include: { eleve: true } },
        recu: { orderBy: { dateEmission: "desc" }, take: 1 },
      },
    });

    if (!payment) {
      throw new ApiError("Paiement introuvable.", 404);
    }

    const receipt = payment.recu[0];
    if (!receipt) {
      throw new ApiError("Aucun reçu n'est encore disponible pour ce paiement.", 404);
    }

    const eleve = payment.duplicata?.eleve ?? payment.documentAcademique?.eleve ?? user;
    const documentTitle = payment.duplicata?.nomDuplicata ?? "Document scolaire";
    const receiptDate = receipt.dateEmission.toLocaleDateString("fr-FR");
    const fileName = `recu-${receipt.numero}.html`;
    const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Reçu ${escapeHtml(receipt.numero)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 48px; }
      .receipt { max-width: 760px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 32px; }
      .brand { font-size: 22px; font-weight: 700; color: #1d4ed8; }
      h1 { margin: 28px 0 8px; font-size: 24px; }
      .muted { color: #64748b; }
      table { width: 100%; margin-top: 28px; border-collapse: collapse; }
      td { padding: 12px 0; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
      td:first-child { color: #64748b; width: 36%; }
      .amount { font-size: 22px; font-weight: 700; }
      .footer { margin-top: 32px; font-size: 13px; color: #64748b; }
      @media print { body { margin: 0; } .receipt { border: none; } }
    </style>
  </head>
  <body>
    <main class="receipt">
      <div class="brand">DR-DOCSCOL</div>
      <p class="muted">Gestion des demandes et retraits de documents scolaires</p>
      <h1>Reçu de paiement</h1>
      <p class="muted">Ce reçu confirme la prise en compte du paiement.</p>
      <table>
        <tr><td>Numéro du reçu</td><td>${escapeHtml(receipt.numero)}</td></tr>
        <tr><td>Élève</td><td>${escapeHtml(`${eleve.prenom} ${eleve.nom}`.trim())}</td></tr>
        <tr><td>Matricule</td><td>${escapeHtml(eleve.matricule)}</td></tr>
        <tr><td>Document scolaire concerné</td><td>${escapeHtml(documentTitle)}</td></tr>
        <tr><td>Mode de paiement</td><td>${escapeHtml(receipt.modePaiement ?? payment.modePaiment)}</td></tr>
        <tr><td>Date d'émission</td><td>${escapeHtml(receiptDate)}</td></tr>
        <tr><td>Montant payé</td><td class="amount">${formatAmount(receipt.montant)} FCFA</td></tr>
        ${receipt.commentaire ? `<tr><td>Commentaire</td><td>${escapeHtml(receipt.commentaire)}</td></tr>` : ""}
      </table>
      <p class="footer">Document généré automatiquement par DR-DOCSCOL.</p>
    </main>
  </body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
