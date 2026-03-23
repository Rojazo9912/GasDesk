import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AdjustDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsString() @IsNotEmpty() locationId: string;
  @IsNumber() @Type(() => Number) cantidad: number;
  @IsOptional() @IsString() notas?: string;
}

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findStock(@CurrentUser() user: any, @Query('locationId') locationId?: string) {
    return this.inventoryService.findStock(user.tenantId, locationId);
  }

  @Get('movements')
  findMovements(
    @CurrentUser() user: any,
    @Query('locationId') locationId?: string,
    @Query('productId') productId?: string,
  ) {
    return this.inventoryService.findMovements(user.tenantId, locationId, productId);
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustDto, @CurrentUser() user: any) {
    return this.inventoryService.adjust(
      user.tenantId,
      dto.productId,
      dto.locationId,
      dto.cantidad,
      dto.notas,
    );
  }
}
