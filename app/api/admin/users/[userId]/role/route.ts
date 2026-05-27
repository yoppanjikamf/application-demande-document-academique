import { z } from "zod";

import { ApiError, handleApiError, json, parseJson, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma/client";

const roleSchema = z.object({
  role: z.nativeEnum(Role),
});

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireApiUser("ADMINISTRATEUR");
    const { userId } = await params;
    const input = await parseJson(request, roleSchema);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });

    if (!user) {
      throw new ApiError("Utilisateur introuvable.", 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role: input.role,
        nomService: input.role === "ADMINISTRATEUR" ? "OBC" : null,
      },
      select: {
        id: true,
        matricule: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        nomService: true,
      },
    });

    return json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
