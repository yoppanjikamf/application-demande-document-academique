import { NextResponse } from "next/server";

import { getAvailableSlots, parseDateKey } from "@/lib/appointment-service";
import { getCurrentUser } from "@/lib/auth";
import { resolveDocumentRoute } from "@/lib/document-routing";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    return NextResponse.json({ error: "Acces refuse." }, { status: 403 });
  }

  const url = new URL(request.url);
  const documentId = url.searchParams.get("documentId");
  const dateValue = url.searchParams.get("date");

  if (!documentId || !dateValue) {
    return NextResponse.json({ error: "Parametres manquants." }, { status: 400 });
  }

  const document = await prisma.documentAcademique.findFirst({
    where: { id: documentId, eleveId: user.id },
    select: {
      id: true,
      statut: true,
      diplomeType: true,
      typeDocument: true,
      centreExamen: true,
      regionComposition: true,
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  if (document.statut !== "DISPONIBLE" || !resolveDocumentRoute(document).requiresAppointment) {
    return NextResponse.json({ slots: [] });
  }

  const date = parseDateKey(dateValue);
  if (!date) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  const slots = await getAvailableSlots(date);
  return NextResponse.json({ slots });
}
