import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { EstatusQuotation, EstatusSC } from '@prisma/client';
import { Resend } from 'resend';

@Injectable()
export class QuotationsService {
  private resend: Resend;

  constructor(private readonly prisma: PrismaService) {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  async create(dto: CreateQuotationDto, user: any) {
    const solicitud = await this.prisma.purchaseRequest.findFirst({
      where: { id: dto.solicitudId, tenantId: user.tenantId },
    });
    if (!solicitud) throw new NotFoundException('Solicitud de compra no encontrada.');

    if (![EstatusSC.PENDIENTE_COMPRAS, EstatusSC.EN_PROCESO].includes(solicitud.estatus)) {
      throw new BadRequestException('Solo se pueden cotizar solicitudes en estado PENDIENTE_COMPRAS o EN_PROCESO.');
    }

    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, tenantId: user.tenantId },
    });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado.');

    const quotation = await this.prisma.quotation.create({
      data: {
        tenantId: user.tenantId,
        solicitudId: dto.solicitudId,
        supplierId: dto.supplierId,
        validezDias: dto.validezDias ?? 15,
        notas: dto.notas ?? null,
        items: {
          create: dto.items.map(i => ({
            productId: i.productId,
            cantidadSolicitada: i.cantidadSolicitada,
            precioUnitario: i.precioUnitario ?? null,
            importe: i.precioUnitario ? i.precioUnitario * i.cantidadSolicitada : null,
          })),
        },
      },
      include: { items: { include: { product: { select: { nombre: true, unidad: true } } } }, supplier: true },
    });

    // Notificar al proveedor por email
    if (process.env.RESEND_API_KEY && supplier.contactoEmail) {
      try {
        await this.resend.emails.send({
          from: 'GasDesk Compras <onboarding@resend.dev>',
          to: supplier.contactoEmail,
          subject: 'Solicitud de Cotización — GasDesk',
          html: `<p>Hola ${supplier.contactoNombre || supplier.nombre},</p>
                 <p>Te solicitamos una cotización para los siguientes artículos. Por favor envíanos tus precios a la brevedad.</p>
                 <p>Validez solicitada: ${quotation.validezDias} días.</p>`,
        });
      } catch (e) {
        console.error('[Quotations] Error enviando email:', e);
      }
    }

    // Actualizar SC a EN_PROCESO si estaba en PENDIENTE_COMPRAS
    if (solicitud.estatus === EstatusSC.PENDIENTE_COMPRAS) {
      await this.prisma.purchaseRequest.update({
        where: { id: dto.solicitudId },
        data: { estatus: EstatusSC.EN_PROCESO },
      });
    }

    return quotation;
  }

  async findBySolicitud(solicitudId: string, tenantId: string) {
    const solicitud = await this.prisma.purchaseRequest.findFirst({
      where: { id: solicitudId, tenantId },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada.');

    return this.prisma.quotation.findMany({
      where: { solicitudId },
      include: {
        supplier: { select: { id: true, nombre: true, rfc: true, contactoNombre: true } },
        items: { include: { product: { select: { nombre: true, unidad: true } } } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.quotation.findMany({
      where: { tenantId },
      include: {
        supplier: { select: { nombre: true } },
        solicitud: { select: { folio: true, id: true } },
        items: true,
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async update(id: string, dto: UpdateQuotationDto, tenantId: string) {
    const quotation = await this.prisma.quotation.findFirst({ where: { id, tenantId } });
    if (!quotation) throw new NotFoundException('Cotización no encontrada.');

    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        await this.prisma.quotationItem.update({
          where: { id: item.id },
          data: {
            precioUnitario: item.precioUnitario,
            importe: item.importe,
          },
        });
      }
    }

    return this.prisma.quotation.update({
      where: { id },
      data: {
        notas: dto.notas,
        estatus: EstatusQuotation.RESPONDIDA,
      },
      include: { items: { include: { product: true } }, supplier: true },
    });
  }

  async select(id: string, user: any) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { items: true, supplier: true },
    });
    if (!quotation) throw new NotFoundException('Cotización no encontrada.');
    if (quotation.estatus === EstatusQuotation.CANCELADA) {
      throw new BadRequestException('No se puede seleccionar una cotización cancelada.');
    }

    // Marcar esta como SELECCIONADA y cancelar las demás de la misma SC
    await this.prisma.$transaction([
      this.prisma.quotation.update({
        where: { id },
        data: { estatus: EstatusQuotation.SELECCIONADA },
      }),
      this.prisma.quotation.updateMany({
        where: { solicitudId: quotation.solicitudId, id: { not: id } },
        data: { estatus: EstatusQuotation.CANCELADA },
      }),
    ]);

    return { message: 'Cotización seleccionada. Ya puedes generar la Orden de Compra.', quotation };
  }

  async cancel(id: string, tenantId: string) {
    const quotation = await this.prisma.quotation.findFirst({ where: { id, tenantId } });
    if (!quotation) throw new NotFoundException('Cotización no encontrada.');

    return this.prisma.quotation.update({
      where: { id },
      data: { estatus: EstatusQuotation.CANCELADA },
    });
  }
}
