import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { DepartmentInventoryService } from './department-inventory.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

class AdjustDeptDto {
  @IsString() @IsNotEmpty() departmentId: string;
  @IsString() @IsNotEmpty() productId: string;
  @IsNumber() @Type(() => Number) cantidad: number;
  @IsOptional() @IsString() notas?: string;
}

class SetStockMinimoDto {
  @IsString() @IsNotEmpty() departmentId: string;
  @IsString() @IsNotEmpty() productId: string;
  @IsNumber() @Type(() => Number) stockMinimo: number;
}

@Controller('department-inventory')
export class DepartmentInventoryController {
  constructor(private readonly service: DepartmentInventoryService) {}

  @Get()
  findStock(
    @CurrentUser() user: any,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.service.findStock(user.tenantId, departmentId);
  }

  @Get('movements')
  findMovements(
    @CurrentUser() user: any,
    @Query('departmentId') departmentId?: string,
    @Query('productId') productId?: string,
  ) {
    return this.service.findMovements(user.tenantId, departmentId, productId);
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustDeptDto, @CurrentUser() user: any) {
    return this.service.adjust(
      user.tenantId,
      dto.departmentId,
      dto.productId,
      dto.cantidad,
      dto.notas,
    );
  }

  @Post('stock-minimo')
  setStockMinimo(@Body() dto: SetStockMinimoDto, @CurrentUser() user: any) {
    return this.service.setStockMinimo(
      user.tenantId,
      dto.departmentId,
      dto.productId,
      dto.stockMinimo,
    );
  }
}
