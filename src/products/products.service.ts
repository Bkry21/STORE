import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationTarget } from '../notifications/notifications.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ===== helper: يحسب badges لكل منتج =====
  private addBadges(product: any) {
    const now = new Date();
    const createdAt = new Date(product.createdAt);
    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    return {
      ...product,
      isNew: diffDays <= 5,
      isTop: product.salesCount >= 10, // غيّر الرقم حسب ما تحب
    };
  }

  async findAll(categoryId?: string) {
    const products = await this.prisma.product.findMany({
      where: categoryId ? { categoryId } : {},
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return products.map(p => this.addBadges(p));
  }

  async findTrending() {
    const products = await this.prisma.product.findMany({
      where: { salesCount: { gte: 10 } }, // نفس رقم isTop
      include: { category: true },
      orderBy: { salesCount: 'desc' },
      take: 10,
    });
    return products.map(p => this.addBadges(p));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.addBadges(product);
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
  }) {
    const product = await this.prisma.product.create({
      data,
      include: { category: true },
    });

    // إشعار تلقائي لكل الزبائن
    await this.notificationsService.sendNotification({
      title: '🛍️ منتج جديد وصل!',
      body: product.name,
      imageUrl: product.images?.[0],
      type: NotificationType.PRODUCT_ADD,
      target: NotificationTarget.ALL,
    });

    return this.addBadges(product);
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
  }>) {
    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
    return this.addBadges(product);
  }

async remove(id: string) {
  // استخدم raw query عشان نتجاوز مشكلة الأسماء
  await this.prisma.$executeRaw`DELETE FROM "CartItem" WHERE "productId" = ${id}`;
  await this.prisma.$executeRaw`DELETE FROM "OrderItem" WHERE "productId" = ${id}`;
  return this.prisma.product.delete({ where: { id } });
}

async deleteCategory(id: string) {
  return this.prisma.category.delete({ where: { id } });
}
  // ===== Categories =====
  async createCategory(data: { name: string; image?: string }) {
    return this.prisma.category.create({ data });
  }

  async findAllCategories() {
    return this.prisma.category.findMany();
  }

  async updateCategory(id: string, data: { name?: string; image?: string }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  // ===== Banners =====
  async findActiveBanners() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async createBanner(data: {
    image: string;
    title?: string;
    subtitle?: string;
    duration?: number;
    order?: number;
  }) {
    return this.prisma.banner.create({ data });
  }

  async updateBanner(id: string, data: Partial<{
    image: string;
    title: string;
    subtitle: string;
    duration: number;
    order: number;
    isActive: boolean;
  }>) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async removeBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}