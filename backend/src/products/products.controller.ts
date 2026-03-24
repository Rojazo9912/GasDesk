import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.constants';
import { Rol } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions(Permission.MANAGE_PRODUCTS)
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(createProductDto, user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.productsService.findAll(tenantFiltrar);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.productsService.findOne(id, tenantFiltrar);
  }

  @Patch(':id')
  @Permissions(Permission.MANAGE_PRODUCTS)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.productsService.update(id, updateProductDto, tenantFiltrar);
  }

  @Delete(':id')
  @Permissions(Permission.MANAGE_PRODUCTS)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.productsService.remove(id, tenantFiltrar);
  }
}
