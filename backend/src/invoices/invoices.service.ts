import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SatService } from './sat.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { EstatusValidacionCFDI } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly satService: SatService,
  ) {}

  async create(dto: CreateInvoiceDto, tenantId: string) {
    // 1. Validar UUID único
    const existing = await this.prisma.invoice.findUnique({
      where: { folioFiscalUuid: dto.folioFiscalUuid },
    });
    if (existing) {
      throw new ConflictException('Este UUID ya fue registrado anteriormente (CFDI duplicado).');
    }

    // 2. Obtener OC para comparar montos y RFC
    const oc = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.ordenId, tenantId },
      include: {
        supplier: { select: { rfc: true } },
        tenant: { select: { rfc: true } },
      },
    });
    if (!oc) throw new NotFoundException('Orden de compra no encontrada.');

    // 3. Determinar estatus de validación local
    let estatusValidacion: EstatusValidacionCFDI = EstatusValidacionCFDI.VALIDA;
    let notasValidacion: string | null = null;

    if (oc.supplier.rfc && dto.rfcEmisor !== oc.supplier.rfc) {
      estatusValidacion = EstatusValidacionCFDI.RFC_INVALIDO;
      notasValidacion = `RFC del CFDI (${dto.rfcEmisor}) no coincide con el proveedor registrado (${oc.supplier.rfc}).`;
    }

    if (estatusValidacion === EstatusValidacionCFDI.VALIDA) {
      const diferenciaPct = Math.abs(dto.total - oc.total) / oc.total;
      if (diferenciaPct > 0.05) {
        estatusValidacion = EstatusValidacionCFDI.DIFERENCIA_MONTO;
        notasValidacion = `Diferencia de ${(diferenciaPct * 100).toFixed(1)}% respecto a la OC ($${oc.total.toFixed(2)} OC vs $${dto.total.toFixed(2)} CFDI).`;
      }
    }

    // 4. Verificar contra el SAT (no bloquea el registro si falla la conexión)
    let validadoPorSAT = false;
    let fechaValidacionSAT: Date | null = null;

    try {
      const satResult = await this.satService.verificarCFDI(
        dto.folioFiscalUuid,
        dto.rfcEmisor,
        oc.tenant.rfc,
        dto.total.toFixed(2),
      );
      validadoPorSAT = satResult.valido;
      fechaValidacionSAT = new Date();

      if (!satResult.valido && estatusValidacion === EstatusValidacionCFDI.VALIDA) {
        notasValidacion = satResult.estado ?? satResult.error ?? 'No verificado por SAT';
      }
    } catch {
      // Ignorar errores de conexión al SAT — el CFDI se registra igual
    }

    return this.prisma.invoice.create({
      data: {
        ordenId: dto.ordenId,
        folioFiscalUuid: dto.folioFiscalUuid,
        xmlUrl: dto.xmlUrl ?? null,
        pdfUrl: dto.pdfUrl ?? null,
        fechaEmision: new Date(dto.fechaEmision),
        subtotal: dto.subtotal,
        iva: dto.iva,
        total: dto.total,
        estatusValidacion,
        notasValidacion,
        validadoPorSAT,
        fechaValidacionSAT,
      },
    });
  }

  async findByOrden(ordenId: string, tenantId: string) {
    const oc = await this.prisma.purchaseOrder.findFirst({ where: { id: ordenId, tenantId } });
    if (!oc) throw new NotFoundException('Orden no encontrada.');

    return this.prisma.invoice.findFirst({
      where: { ordenId },
      orderBy: { creadoEn: 'desc' },
    });
  }
}
