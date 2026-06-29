import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/** Réveille Vercel + Postgres avant la démo. GET /api/health */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: true }, { status: 200 });
  } catch (error) {
    console.error("[health] database ping failed:", error);
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
