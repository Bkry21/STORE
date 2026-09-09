import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto, SendNotificationDto } from './notifications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // تسجيل توكن الجهاز
  @Post('register-token')
  registerToken(@Request() req: any, @Body() dto: RegisterTokenDto) {
    return this.notificationsService.registerToken(req.user.id, dto);
  }

  // جلب إشعاراتي
  @Get()
  getMyNotifications(@Request() req: any) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  // عدد الغير مقروءة
  @Get('unread-count')
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  // تعليم إشعار كمقروء
  @Put(':id/read')
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  // تعليم الكل كمقروء
  @Put('mark-all-read')
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // إرسال إشعار (ADMIN فقط)
  @Post('send')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }
}
