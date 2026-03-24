import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Roles(Rol.COMPRAS, Rol.ADMIN, Rol.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateQuotationDto, @CurrentUser() user: any) {
    return this.quotationsService.create(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.quotationsService.findAll(user.tenantId);
  }

  @Get('solicitud/:solicitudId')
  findBySolicitud(@Param('solicitudId') solicitudId: string, @CurrentUser() user: any) {
    return this.quotationsService.findBySolicitud(solicitudId, user.tenantId);
  }

  @Roles(Rol.COMPRAS, Rol.ADMIN, Rol.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuotationDto, @CurrentUser() user: any) {
    return this.quotationsService.update(id, dto, user.tenantId);
  }

  @Roles(Rol.COMPRAS, Rol.ADMIN, Rol.SUPER_ADMIN)
  @Patch(':id/select')
  select(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationsService.select(id, user);
  }

  @Roles(Rol.COMPRAS, Rol.ADMIN, Rol.SUPER_ADMIN)
  @Delete(':id')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationsService.cancel(id, user.tenantId);
  }
}
