import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.constants';
import { Req } from '@nestjs/common';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Permissions(Permission.VIEW_AUDIT)
  async findAll(
    @Req() req: any,
    @Query('entidad') entidad?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.auditLogService.findAll(req.user.tenantId, {
      entidad,
      usuarioId,
      fechaDesde: desde,
      fechaHasta: hasta,
    });
  }
}
