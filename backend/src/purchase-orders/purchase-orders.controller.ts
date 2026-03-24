import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.constants';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Permissions(Permission.CREATE_OC)
  @Post()
  create(@Body() createDto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
    return this.purchaseOrdersService.create(createDto, user);
  }

  @Permissions(Permission.VIEW_OC)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.purchaseOrdersService.findAll(user.tenantId);
  }

  @Permissions(Permission.VIEW_OC)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.findOne(id, user.tenantId);
  }

  @Permissions(Permission.CREATE_OC)
  @Post(':id/send')
  sendToSupplier(@Param('id') id: string, @Body('pdfUrl') pdfUrl: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.sendToSupplier(id, pdfUrl, user.tenantId);
  }
}
