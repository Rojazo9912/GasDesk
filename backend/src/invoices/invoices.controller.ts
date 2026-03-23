import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.create(dto, user.tenantId);
  }

  @Get('orden/:ordenId')
  findByOrden(@Param('ordenId') ordenId: string, @CurrentUser() user: any) {
    return this.invoicesService.findByOrden(ordenId, user.tenantId);
  }
}
