import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Module({
  imports: [AuthModule],
  controllers: [CartController],
  providers: [CartService, PrismaService, JwtAuthGuard],
})
export class CartModule {}