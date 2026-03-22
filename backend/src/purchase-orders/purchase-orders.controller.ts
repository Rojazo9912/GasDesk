import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPRAS')
  @Post()
  create(@Body() createDto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
    return this.purchaseOrdersService.create(createDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.purchaseOrdersService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.findOne(id, user.tenantId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPRAS')
  @Post(':id/send')
  sendToSupplier(@Param('id') id: string, @Body('pdfUrl') pdfUrl: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.sendToSupplier(id, pdfUrl, user.tenantId);
  }
}
