import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTokenDto, SendNotificationDto, NotificationTarget, NotificationType } from './notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // تسجيل توكن الجهاز
  async registerToken(userId: string, dto: RegisterTokenDto) {
    return this.prisma.deviceToken.upsert({
      where: { token: dto.token },
      update: { userId },
      create: { userId, token: dto.token },
    });
  }

  // إرسال إشعار (عام أو لمستخدم محدد)
  async sendNotification(dto: SendNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        type: dto.type as any,
        target: dto.target as any,
        userId: dto.target === NotificationTarget.USER ? dto.userId : null,
      },
    });

    let tokens: string[] = [];

    if (dto.target === NotificationTarget.USER && dto.userId) {
      const userTokens = await this.prisma.deviceToken.findMany({
        where: { userId: dto.userId },
        select: { token: true },
      });
      tokens = userTokens.map((t) => t.token);
    } else {
      const allTokens = await this.prisma.deviceToken.findMany({
        select: { token: true },
      });
      tokens = allTokens.map((t) => t.token);
    }

    if (tokens.length > 0) {
      await this.sendExpoPush(tokens, dto.title, dto.body, {
        type: dto.type,
        imageUrl: dto.imageUrl,
      });
    }

    return notification;
  }

  // إشعار تلقائي عند تغيير حالة الأوردر
  async notifyOrderStatus(userId: string, orderId: string, status: string) {
    const statusLabels: Record<string, string> = {
      CONFIRMED: 'تم تأكيد طلبك ✅',
      SHIPPED: 'طلبك في الطريق إليك 🚚',
      DELIVERED: 'تم تسليم طلبك بنجاح 🎉',
      CANCELLED: 'تم إلغاء طلبك ❌',
    };

    const label = statusLabels[status];
    if (!label) return;

    await this.sendNotification({
      title: label,
      body: `رقم الطلب: ${orderId.slice(0, 8).toUpperCase()}`,
      type: NotificationType.ORDER_STATUS,
      target: NotificationTarget.USER,
      userId,
    });
  }

  // جلب إشعارات المستخدم
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        OR: [{ target: NotificationTarget.ALL as any }, { userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // تعليم إشعار كمقروء
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  // تعليم كل الإشعارات كمقروءة
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }

  // عدد الإشعارات الغير مقروءة
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        isRead: false,
        OR: [{ target: NotificationTarget.ALL as any }, { userId }],
      },
    });
    return { count };
  }

  private async sendExpoPush(tokens: string[], title: string, body: string, data?: any) {
    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
    } catch (error) {
      console.error('Expo push failed:', error);
    }
  }
}
