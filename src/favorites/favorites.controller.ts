import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

@Get()
getAll(@Req() req: any) {
  return this.favoritesService.getAll(req.user.sub);
}

@Post(':productId/toggle')
toggle(@Req() req: any, @Param('productId') productId: string) {
  return this.favoritesService.toggle(req.user.sub, productId);
}

@Get(':productId/check')
check(@Req() req: any, @Param('productId') productId: string) {
  return this.favoritesService.isFavorite(req.user.sub, productId);
}
}