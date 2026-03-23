import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardStats(@CurrentUser() user: any) {
    return this.reportsService.getDashboardStats(user.tenantId);
  }

  @Get('gastos-proveedor')
  getGastosPorProveedor(
    @CurrentUser() user: any,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.reportsService.getGastosPorProveedor(user.tenantId, desde, hasta);
  }

  @Get('sc-por-estatus')
  getSCPorEstatus(@CurrentUser() user: any) {
    return this.reportsService.getSCPorEstatus(user.tenantId);
  }

  @Get('oc-recientes')
  getOCRecientes(@CurrentUser() user: any) {
    return this.reportsService.getOCRecientes(user.tenantId);
  }
}
