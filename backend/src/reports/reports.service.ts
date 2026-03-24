import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstatusSC, EstatusOC } from '@prisma/client';
import * as ExcelJS from 'exceljs';

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
              EstatusSC.PENDIENTE_NIVEL_1,
              EstatusSC.PENDIENTE_NIVEL_2,
              EstatusSC.PENDIENTE_NIVEL_3,
              EstatusSC.PENDIENTE_COMPRAS,
            ],
          },
        },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          tenantId,
          estatus: { in: [EstatusOC.ENVIADA, EstatusOC.RECIBIDA_PARCIAL] },
        },
      }),
      this.prisma.purchaseOrder.aggregate({
        _sum: { total: true },
        where: {
          tenantId,
          fechaEmision: { gte: firstDayOfMonth },
          estatus: { not: EstatusOC.CANCELADA },
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
        estatus: { not: EstatusOC.CANCELADA },
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

  // Priority 12: Métricas para Dashboard
  async getSpendingTrend(tenantId: string) {
    const months = 6;
    const result: { month: string; total: number }[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const sum = await this.prisma.purchaseOrder.aggregate({
        _sum: { total: true },
        where: {
          tenantId,
          fechaEmision: { gte: start, lte: end },
          estatus: { not: EstatusOC.CANCELADA }
        }
      });

      result.push({
        month: start.toLocaleString('default', { month: 'short' }),
        total: sum._sum.total ?? 0
      });
    }

    return result.reverse();
  }

  async getTopSuppliers(tenantId: string) {
    const result = await this.prisma.purchaseOrder.groupBy({
      by: ['supplierId'],
      where: {
        tenantId,
        estatus: { not: EstatusOC.CANCELADA }
      },
      _sum: { total: true },
      orderBy: {
        _sum: { total: 'desc' }
      },
      take: 5
    });

    // Enriquecer con nombres de proveedores
    const enriched = await Promise.all(result.map(async (r) => {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: r.supplierId },
        select: { nombre: true }
      });
      return {
        name: supplier?.nombre || 'Desconocido',
        value: r._sum.total || 0
      };
    }));

    return enriched;
  }

  async getApprovalTimeAvg(tenantId: string) {
    // Calculamos el promedio de tiempo entre sc.creadoEn y oc.fechaEmision
    // Solo para órdenes que ya existen vinculadas a una SC
    const data = await this.prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        solicitudId: { not: null } as any
      },
      select: {
        fechaEmision: true,
        solicitud: { select: { creadoEn: true } }
      }
    }) as any[];

    if (data.length === 0) return 0;

    const totalMs = data.reduce((acc, curr) => {
      const diff = curr.fechaEmision.getTime() - curr.solicitud.creadoEn.getTime();
      return acc + diff;
    }, 0);

    const avgHrs = (totalMs / data.length) / (1000 * 60 * 60);
    return Math.round(avgHrs * 10) / 10; // 1 decimal
  }

  // ─── Excel exports ────────────────────────────────────────────────────────────

  private styleHeader(row: ExcelJS.Row) {
    row.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF047857' } },
      };
    });
    row.height = 20;
  }

  async getGastosProveedorExcel(tenantId: string, desde?: string, hasta?: string): Promise<Buffer> {
    const data = await this.getGastosPorProveedor(tenantId, desde, hasta);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'GasDesk';
    const ws = wb.addWorksheet('Gastos por Proveedor');

    ws.columns = [
      { header: 'Proveedor', key: 'nombre', width: 35 },
      { header: 'RFC', key: 'rfc', width: 18 },
      { header: 'Órdenes', key: 'totalOrdenes', width: 12 },
      { header: 'Monto Total (MXN)', key: 'montoTotal', width: 22 },
    ];

    this.styleHeader(ws.getRow(1));

    for (const row of data as any[]) {
      ws.addRow({
        nombre: row.supplier.nombre,
        rfc: row.supplier.rfc,
        totalOrdenes: row.totalOrdenes,
        montoTotal: row.montoTotal,
      });
    }

    ws.getColumn('montoTotal').numFmt = '"$"#,##0.00';

    return (wb.xlsx.writeBuffer() as unknown) as Promise<Buffer>;
  }

  async getScPorEstatusExcel(tenantId: string): Promise<Buffer> {
    const data = await this.getSCPorEstatus(tenantId);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'GasDesk';
    const ws = wb.addWorksheet('SC por Estatus');

    ws.columns = [
      { header: 'Estatus', key: 'estatus', width: 30 },
      { header: 'Total', key: 'total', width: 12 },
    ];

    this.styleHeader(ws.getRow(1));

    for (const row of data) {
      ws.addRow({ estatus: row.estatus, total: row.total });
    }

    return (wb.xlsx.writeBuffer() as unknown) as Promise<Buffer>;
  }

  async getOcRecientesExcel(tenantId: string): Promise<Buffer> {
    const data = await this.getOCRecientes(tenantId);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'GasDesk';
    const ws = wb.addWorksheet('OC Recientes');

    ws.columns = [
      { header: 'Folio', key: 'folio', width: 10 },
      { header: 'Proveedor', key: 'proveedor', width: 30 },
      { header: 'Sucursal', key: 'sucursal', width: 25 },
      { header: 'Estatus', key: 'estatus', width: 18 },
      { header: 'Total (MXN)', key: 'total', width: 18 },
      { header: 'Fecha Emisión', key: 'fecha', width: 18 },
    ];

    this.styleHeader(ws.getRow(1));

    for (const oc of data as any[]) {
      ws.addRow({
        folio: oc.folio,
        proveedor: oc.supplier?.nombre ?? '',
        sucursal: oc.location?.nombre ?? '',
        estatus: oc.estatus,
        total: oc.total,
        fecha: new Date(oc.fechaEmision).toLocaleDateString('es-MX'),
      });
    }

    ws.getColumn('total').numFmt = '"$"#,##0.00';

    return (wb.xlsx.writeBuffer() as unknown) as Promise<Buffer>;
  }
}
