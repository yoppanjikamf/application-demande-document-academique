import { NextResponse } from "next/server";

import {
  formatDateKey,
  getAvailableSlots,
  isBeforeTomorrow,
  parseDateKey,
} from "@/lib/appointment-service";
import { getCurrentUser } from "@/lib/auth";
import { resolvePickupRouteForDocument } from "@/lib/duplicata-service";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const url = new URL(request.url);
  const documentId = url.searchParams.get("documentId");
  const dateValue = url.searchParams.get("date");

  if (!documentId || !dateValue) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  const document = await prisma.documentAcademique.findFirst({
    where: { id: documentId, eleveId: user.id },
    select: {
      id: true,
      eleveId: true,
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

  if (document.typeDocument === "DUPLICATA") {
    return NextResponse.json({
      error: "Les duplicatas ne passent pas par les rendez-vous centre d'examen.",
      slots: [],
    });
  }

  if (
    document.statut !== "DISPONIBLE" ||
    !(await resolvePickupRouteForDocument(document)).requiresAppointment
  ) {
    return NextResponse.json({ slots: [] });
  }

  const date = parseDateKey(dateValue);
  if (!date || isBeforeTomorrow(date)) {
    return NextResponse.json(
      { error: "Les rendez-vous doivent être programmés à partir du lendemain." },
      { status: 400 },
    );
  }

  const slots = await getAvailableSlots(date);
  return NextResponse.json({ date: formatDateKey(date), slots });
}
