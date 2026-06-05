import { ApiError, handleApiError, json, requireApiUser } from "@/lib/api-utils";
import { deleteUserNotification } from "@/lib/notification-service";

type RouteContext = {
  params: Promise<{ notificationId: string }>;
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser("ELEVE");
    const { notificationId } = await params;

    if (!notificationId) {
      throw new ApiError("Notification introuvable.", 404);
    }

    const result = await deleteUserNotification(user.id, notificationId);

    if (result.count === 0) {
      throw new ApiError("Notification introuvable.", 404);
    }

    return json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
