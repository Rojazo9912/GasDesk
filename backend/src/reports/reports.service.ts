import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [scPendientes, ocEnTransito, gastosData] = await Promise.all([
      this.prisma.purchaseRequest.count({
        where: {
          tenantId,
          estatus: {
            in: [
              'PENDIENTE_NIVEL_1',
              'PENDIENTE_NIVEL_2',
              'PENDIENTE_NIVEL_3',
              'PENDIENTE_COMPRAS',
            ] as any[],
          },
        },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          tenantId,
          estatus: { in: ['ENVIADA', 'RECIBIDA_PARCIAL'] as any[] },
        },
      }),
      this.prisma.purchaseOrder.aggregate({
        _sum: { total: true },
        where: {
          tenantId,
          fechaEmision: { gte: firstDayOfMonth },
          estatus: { not: 'CANCELADA' as any },
        },
      }),
    ]);

    const alertasResult = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM "Inventory" i
      JOIN "Product" p ON i."productId" = p.id
      WHERE p."tenantId" = ${tenantId}
        AND p."stockMinimo" > 0
        AND i.cantidad <= p."stockMinimo"
    `;

    return {
      scPendientes,
      ocEnTransito,
      gastosEsteMes: gastosData._sum.total ?? 0,
      alertasInventario: Number(alertasResult[0]?.count ?? 0),
    };
  }

  async getGastosPorProveedor(tenantId: string, desde?: string, hasta?: string) {
    const whereDate: any = {};
    if (desde) whereDate.gte = new Date(desde);
    if (hasta) whereDate.lte = new Date(hasta);

    const ordenes = await this.prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        estatus: { not: 'CANCELADA' as any },
        ...(Object.keys(whereDate).length ? { fechaEmision: whereDate } : {}),
      },
      include: {
        supplier: { select: { id: true, nombre: true, rfc: true } },
      },
      orderBy: { fechaEmision: 'desc' },
    });

    const bySupplier: Record<string, any> = {};
    for (const o of ordenes) {
      const key = o.supplierId;
      if (!bySupplier[key]) {
        bySupplier[key] = { supplier: o.supplier, totalOrdenes: 0, montoTotal: 0 };
      }
      bySupplier[key].totalOrdenes++;
      bySupplier[key].montoTotal += o.total;
    }

    return Object.values(bySupplier).sort((a: any, b: any) => b.montoTotal - a.montoTotal);
  }

  async getSCPorEstatus(tenantId: string) {
    const result = await this.prisma.purchaseRequest.groupBy({
      by: ['estatus'],
      where: { tenantId },
      _count: { id: true },
    });
    return result.map(r => ({ estatus: r.estatus, total: r._count.id }));
  }

  async getOCRecientes(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: {
        supplier: { select: { nombre: true } },
        location: { select: { nombre: true } },
      },
      orderBy: { fechaEmision: 'desc' },
      take: 50,
    });
  }
}
