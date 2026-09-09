import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  // كل الـ cart endpoints تحتاج تسجيل دخول
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post(':userId/items')
  @UseGuards(JwtAuthGuard)
  addItem(
    @Param('userId') userId: string,
    @Body() body: { productId: string; quantity: number },
  ) {
    return this.cartService.addItem(userId, body.productId, body.quantity);
  }

  @Delete(':userId/items/:itemId')
  @UseGuards(JwtAuthGuard)
  removeItem(
    @Param('userId') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete(':userId/clear')
  @UseGuards(JwtAuthGuard)
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}