import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createOrder(userId: string, addressId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0)
      throw new NotFoundException('Cart is empty');

    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        userId,
        addressId,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } }, address: true },
    });

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // إشعار تأكيد الطلب
    await this.notificationsService.notifyOrderStatus(userId, order.id, 'CONFIRMED');

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, address: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, address: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (status === 'DELIVERED') {
      await Promise.all(
        order.items.map((item) =>
          this.prisma.product.update({
            where: { id: item.productId },
            data: {
              salesCount: { increment: item.quantity },
              stock: { decrement: item.quantity },
            },
          }),
        ),
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: { include: { product: true } }, address: true },
    });

    // إشعار تلقائي عند كل تغيير في الحالة
    await this.notificationsService.notifyOrderStatus(order.userId, id, status);

    return updated;
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } }, address: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
