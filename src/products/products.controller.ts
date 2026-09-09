import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ===== Static GET routes أولاً =====
  @Get('categories/all')
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('banners/active')
  findActiveBanners() {
    return this.productsService.findActiveBanners();
  }

  @Get('trending')
  findTrending() {
    return this.productsService.findTrending();
  }

  // ===== Categories Admin =====
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createCategory(@Body() body: { name: string; image?: string }) {
    return this.productsService.createCategory(body);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateCategory(@Param('id') id: string, @Body() body: { name?: string; image?: string }) {
    return this.productsService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteCategory(@Param('id') id: string) {
    return this.productsService.deleteCategory(id);
  }

  // ===== Banners Admin =====
  @Post('banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createBanner(@Body() body: {
    image: string;
    title?: string;
    subtitle?: string;
    duration?: number;
    order?: number;
  }) {
    return this.productsService.createBanner(body);
  }

  @Put('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateBanner(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateBanner(id, body);
  }

  @Delete('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeBanner(@Param('id') id: string) {
    return this.productsService.removeBanner(id);
  }

  // ===== Products — Dynamic routes أخيراً =====
  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.productsService.findAll(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() body: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
  }) {
    return this.productsService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}