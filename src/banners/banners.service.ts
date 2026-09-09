import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationTarget } from '../notifications/notifications.dto';

@Injectable()
export class BannersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  findAll() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async create(data: { image: string; title?: string; subtitle?: string; duration?: number; order?: number }) {
    const banner = await this.prisma.banner.create({ data });

    // إشعار تلقائي لكل الزبائن
    await this.notificationsService.sendNotification({
      title: '🎉 عرض جديد!',
      body: banner.title || 'شوف أحدث العروض والتخفيضات',
      imageUrl: banner.image,
      type: NotificationType.BANNER_ADD,
      target: NotificationTarget.ALL,
    });

    return banner;
  }

  update(id: string, data: Partial<{ image: string; title: string; subtitle: string; duration: number; order: number; isActive: boolean }>) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}