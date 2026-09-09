import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createOrder(@Req() req: any, @Body() body: { addressId: string }) {
    return this.ordersService.createOrder(req.user.sub, body.addressId);
  }

  @Get('my')                          // ← غيّرنا من user/:userId لـ my
  @UseGuards(JwtAuthGuard)
  getUserOrders(@Req() req: any) {
    return this.ordersService.getUserOrders(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrder(@Param('id') id: string) {
    return this.ordersService.getOrder(id);
  }

  @Get()                              // ← كان 'all' وهذا بيتعارض مع ':id'
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateStatus(id, body.status);
  }
}