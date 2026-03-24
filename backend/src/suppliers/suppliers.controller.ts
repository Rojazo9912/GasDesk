import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateSupplierPriceDto } from './dto/create-supplier-price.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.constants';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Permissions(Permission.MANAGE_SUPPLIERS)
  @Post()
  create(@Body() createDto: CreateSupplierDto, @CurrentUser() user: any) {
    return this.suppliersService.create(createDto, user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.suppliersService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.suppliersService.findOne(id, user.tenantId);
  }

  @Permissions(Permission.MANAGE_SUPPLIERS)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSupplierDto, @CurrentUser() user: any) {
    return this.suppliersService.update(id, updateDto, user.tenantId);
  }

  @Permissions(Permission.MANAGE_SUPPLIERS)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.suppliersService.remove(id, user.tenantId);
  }

  // Precios por Proveedor
  @Permissions(Permission.MANAGE_PRICES)
  @Post(':id/prices')
  addPrice(
    @Param('id') id: string,
    @Body() dto: CreateSupplierPriceDto,
    @CurrentUser() user: any
  ) {
    return this.suppliersService.addPrice(id, dto, user.tenantId);
  }

  @Get(':id/prices')
  getPrices(@Param('id') id: string, @CurrentUser() user: any) {
    return this.suppliersService.getPrices(id, user.tenantId);
  }
}
