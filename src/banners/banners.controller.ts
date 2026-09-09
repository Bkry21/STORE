import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // للمستخدمين — البنرات الفعالة فقط
  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  // للأدمن — كل البنرات
  @Get('admin')
  findAllAdmin() {
    return this.bannersService.findAllAdmin();
  }

  @Post()
  create(@Body() body: { image: string; title?: string; subtitle?: string; duration?: number; order?: number }) {
    return this.bannersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bannersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}