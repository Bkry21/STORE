import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(name: string, image?: string) {
    try {
      return await this.prisma.category.create({
        data: { name, image },
      });
    } catch {
      throw new ConflictException('Category name already exists');
    }
  }

  async update(id: string, name?: string, image?: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { ...(name && { name }), ...(image && { image }) },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}
