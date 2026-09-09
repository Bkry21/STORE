import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, street: string, city: string) {
    return this.prisma.address.create({
      data: { userId, street, city },
    });
  }

  async getUserAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }
}