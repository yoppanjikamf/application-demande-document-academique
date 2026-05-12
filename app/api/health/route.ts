import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function describeUrl(value?: string) {
  if (!value) return null;

  const url = new URL(value);
  return {
    host: url.hostname,
    port: url.port || null,
    search: url.search || null,
  };
}

export async function GET() {
  const user = await prisma.user.findUnique({
    where: { matricule: "ELEVE001" },
    select: { email: true, matricule: true, role: true },
  });

  return NextResponse.json(
    {
      ok: true,
      databaseUrl: describeUrl(process.env.DATABASE_URL),
      directUrl: describeUrl(process.env.DIRECT_URL),
      userFound: Boolean(user),
    },
    { status: 200 },
  );
}
