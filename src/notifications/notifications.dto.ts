import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum NotificationTarget {
  ALL = 'ALL',
  USER = 'USER',
}

export enum NotificationType {
  PRODUCT_ADD = 'PRODUCT_ADD',
  BANNER_ADD = 'BANNER_ADD',
  ORDER_STATUS = 'ORDER_STATUS',
  CART_REMINDER = 'CART_REMINDER',
  GENERAL = 'GENERAL',
}

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationTarget)
  target: NotificationTarget;

  @IsOptional()
  @IsString()
  userId?: string;
}
