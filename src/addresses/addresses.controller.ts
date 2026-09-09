import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('addresses')
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: { userId: string; street: string; city: string }) {
    return this.addressesService.create(body.userId, body.street, body.city);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  getUserAddresses(@Param('userId') userId: string) {
    return this.addressesService.getUserAddresses(userId);
  }
}