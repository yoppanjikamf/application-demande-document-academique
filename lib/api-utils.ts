import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, type AuthenticatedUser } from "@/lib/auth";
import type { Role } from "@/lib/generated/prisma/client";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export async function readJson(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new ApiError("Corps JSON invalide.", 400);
  }
}

export async function parseJson<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const body = await readJson(request);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError("Donnees invalides.", 400);
  }

  return parsed.data as z.infer<TSchema>;
}

export async function requireApiUser(role?: Role): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError("Connexion requise.", 401);
  }

  if (role && user.role !== role) {
    throw new ApiError("Accès refusé.", 403);
  }

  if (user.role === "ADMINISTRATEUR" && user.organismeId && !user.antenneRegionaleId) {
    throw new ApiError("Selection de region requise.", 403);
  }

  return user;
}

export function requireInternalRequest(request: Request) {
  const secret = process.env.INTERNAL_API_SECRET;

  if (!secret) {
    throw new ApiError("Secret interne non configure.", 503);
  }

  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  const headerSecret = request.headers.get("x-internal-secret");

  if (bearer !== secret && headerSecret !== secret) {
    throw new ApiError("Accès interne refusé.", 401);
  }
}

export function getPageParams(request: Request, pageSize = 20) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit") ?? pageSize) || pageSize),
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return json({ error: error.message }, error.status);
  }

  console.error(error);
  return json({ error: "Erreur serveur." }, 500);
}
