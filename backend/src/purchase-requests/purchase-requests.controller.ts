import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(private readonly purchaseRequestsService: PurchaseRequestsService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseRequestDto, @CurrentUser() user: any) {
    return this.purchaseRequestsService.create(createDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('estatus') estatus?: string,
    @Query('locationId') locationId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.purchaseRequestsService.findAll(user.tenantId, { estatus, locationId, desde, hasta });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseRequestsService.findOne(id, user.tenantId);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body('comentario') comentario: string, @CurrentUser() user: any) {
    return this.purchaseRequestsService.approve(id, comentario, user);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body('comentario') comentario: string, @CurrentUser() user: any) {
    return this.purchaseRequestsService.reject(id, comentario, user);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseRequestsService.markAsCompleted(id, user);
  }
}
