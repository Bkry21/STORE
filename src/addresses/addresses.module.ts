import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Module({
  imports: [AuthModule],
  controllers: [AddressesController],
  providers: [AddressesService, PrismaService, JwtAuthGuard],
})
export class AddressesModule {}