import { getPageParams, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser("ELEVE");
    const { page, limit, skip } = getPageParams(request);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id, deletedAt: null },
        orderBy: { dateEnvoi: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id, deletedAt: null } }),
    ]);

    return json({ notifications, pagination: { page, limit, total } });
  } catch (error) {
    return handleApiError(error);
  }
}
