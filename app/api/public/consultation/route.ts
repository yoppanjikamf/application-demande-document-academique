import { NextResponse } from "next/server";
import { z } from "zod";

import { lookupPublicConsultationByMatricule } from "@/lib/public-consultation";
import { checkRateLimit } from "@/lib/simple-rate-limit";

const bodySchema = z.object({
  matricule: z.string().min(3).max(40),
});

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(`consultation:${clientKey}`);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques instants." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Matricule invalide." }, { status: 400 });
  }

  const result = await lookupPublicConsultationByMatricule(parsed.data.matricule);
  return NextResponse.json(result);
}
