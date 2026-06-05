import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

type NotificationClient = Prisma.TransactionClient | typeof prisma;

export type CreateNotificationInput = {
  userId: string;
  typeNotification: string;
  title?: string;
  message: string;
  actionUrl?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createNotification(
  input: CreateNotificationInput,
  client: NotificationClient = prisma,
) {
  return client.notification.create({
    data: {
      userId: input.userId,
      typeNotification: input.typeNotification,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
      metadata: input.metadata,
    },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      deletedAt: null,
      statut: { not: "LUE" },
    },
  });
}

export async function markNotificationsAsRead(userId: string, notificationIds?: string[]) {
  return prisma.notification.updateMany({
    where: {
      userId,
      deletedAt: null,
      statut: { not: "LUE" },
      ...(notificationIds ? { id: { in: notificationIds } } : {}),
    },
    data: { statut: "LUE" },
  });
}

export async function deleteUserNotification(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function deleteAllUserNotifications(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}
