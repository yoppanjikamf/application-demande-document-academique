import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/** Ping DB. Appelé aussi par le cron Vercel quotidien pour éviter la pause Supabase. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: true }, { status: 200 });
  } catch (error) {
    console.error("[health] database ping failed:", error);
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
