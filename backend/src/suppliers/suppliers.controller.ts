import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPRAS')
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

  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPRAS')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSupplierDto, @CurrentUser() user: any) {
    return this.suppliersService.update(id, updateDto, user.tenantId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPRAS')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.suppliersService.remove(id, user.tenantId);
  }
}
