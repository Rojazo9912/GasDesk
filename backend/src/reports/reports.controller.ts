import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.constants';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Permissions(Permission.VIEW_REPORTS)
  getDashboardStats(@CurrentUser() user: any) {
    return this.reportsService.getDashboardStats(user.tenantId);
  }

  @Get('trend')
  @Permissions(Permission.VIEW_REPORTS)
  getSpendingTrend(@CurrentUser() user: any) {
    return this.reportsService.getSpendingTrend(user.tenantId);
  }

  @Get('top-suppliers')
  @Permissions(Permission.VIEW_REPORTS)
  getTopSuppliers(@CurrentUser() user: any) {
    return this.reportsService.getTopSuppliers(user.tenantId);
  }

  @Get('approval-time')
  @Permissions(Permission.VIEW_REPORTS)
  getApprovalTimeAvg(@CurrentUser() user: any) {
    return this.reportsService.getApprovalTimeAvg(user.tenantId);
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

  // ─── Excel exports ────────────────────────────────────────────────────────────

  @Get('gastos-proveedor/xlsx')
  async getGastosProveedorExcel(
    @CurrentUser() user: any,
    @Res() res: any,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const buffer = await this.reportsService.getGastosProveedorExcel(user.tenantId, desde, hasta);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="gastos-proveedores.xlsx"',
    });
    res.send(buffer);
  }

  @Get('sc-por-estatus/xlsx')
  async getScPorEstatusExcel(@CurrentUser() user: any, @Res() res: any) {
    const buffer = await this.reportsService.getScPorEstatusExcel(user.tenantId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="sc-por-estatus.xlsx"',
    });
    res.send(buffer);
  }

  @Get('oc-recientes/xlsx')
  async getOcRecientesExcel(@CurrentUser() user: any, @Res() res: any) {
    const buffer = await this.reportsService.getOcRecientesExcel(user.tenantId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="oc-recientes.xlsx"',
    });
    res.send(buffer);
  }
}
