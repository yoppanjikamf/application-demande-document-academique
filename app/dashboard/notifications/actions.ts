"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { deleteAllUserNotifications, deleteUserNotification } from "@/lib/notification-service";

export async function deleteNotificationAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Accès refusé.");
  }

  const notificationId = String(formData.get("notificationId") ?? "");
  if (!notificationId) {
    throw new Error("Notification introuvable.");
  }

  await deleteUserNotification(user.id, notificationId);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}

export async function deleteAllNotificationsAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ELEVE") {
    throw new Error("Accès refusé.");
  }

  await deleteAllUserNotifications(user.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}
