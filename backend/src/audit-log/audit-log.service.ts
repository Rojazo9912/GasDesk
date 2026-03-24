import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, filters: any) {
    const { entidad, usuarioId, fechaDesde, fechaHasta } = filters;
    
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        entidad: entidad || undefined,
        userId: usuarioId || undefined,
        fecha: {
          gte: fechaDesde ? new Date(fechaDesde) : undefined,
          lte: fechaHasta ? new Date(fechaHasta) : undefined,
        },
      },
      include: {
        user: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    });
  }

  async create(data: {
    tenantId: string;
    userId?: string;
    entidad: string;
    entidadId: string;
    accion: string;
    camposModificados?: any;
  }) {
    return this.prisma.auditLog.create({
      data,
    });
  }
}
