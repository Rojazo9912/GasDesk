import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { EstatusOC } from '@prisma/client';
import { Resend } from 'resend';

@Injectable()
export class PurchaseOrdersService {
  private resend: Resend;

  constructor(private readonly prisma: PrismaService) {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  async create(createDto: CreatePurchaseOrderDto, user: any) {
    // Validar subtotal, iva, total en backend idealmente... (lo omitiremos y confiaremos en frontend por MVP)
    const tx = await this.prisma.$transaction(async (prisma) => {
      // 1. Crear Orden
      const oc = await prisma.purchaseOrder.create({
        data: {
          tenantId: user.tenantId,
          solicitudId: createDto.solicitudId,
          supplierId: createDto.supplierId,
          locationId: createDto.locationId,
          subtotal: createDto.subtotal,
          iva: createDto.iva,
          total: createDto.total,
          fechaEntregaEsperada: createDto.fechaEntregaEsperada ? new Date(createDto.fechaEntregaEsperada) : null,
          items: {
            create: createDto.items.map(i => ({
              productId: i.productId,
              cantidadOrdenada: i.cantidadOrdenada,
              precioUnitario: i.precioUnitario,
              importe: i.importe
            }))
          }
        },
        include: { items: true, supplier: true }
      });

      return oc;
    });

    return tx;
  }

  async findAll(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: {
        supplier: { select: { nombre: true } },
        location: { select: { nombre: true } },
        solicitud: { select: { id: true, notas: true } } // folio on PR isn't in schema but we handle it via id/fecha
      },
      orderBy: { fechaEmision: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const oc = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        location: true,
        solicitud: { select: { id: true, solicitante: { select: { nombre: true} } } },
        items: { include: { product: true } }
      }
    });
    if (!oc) throw new NotFoundException('OC no encontrada');
    return oc;
  }

  async sendToSupplier(id: string, pdfUrl: string, tenantId: string) {
    const oc = await this.findOne(id, tenantId);

    // Actualizamos estatus y pdfUrl
    await this.prisma.purchaseOrder.update({
      where: { id },
      data: { estatus: EstatusOC.ENVIADA, pdfUrl }
    });

    // Enviar correo si el api key está provisto
    if (process.env.RESEND_API_KEY && oc.supplier.contactoEmail) {
      try {
        await this.resend.emails.send({
          from: 'GasDesk Compras <onboarding@resend.dev>',
          to: oc.supplier.contactoEmail,
          subject: `Orden de Compra / GasDesk`,
          html: `
            <p>Hola ${oc.supplier.contactoNombre || oc.supplier.nombre},</p>
            <p>Adjunto a este mensaje encontrarás nuestra nueva Órden de Compra por un total de $${oc.total.toFixed(2)} MXN.</p>
            <p><strong><a href="${pdfUrl}" target="_blank">VER ÓRDEN DE COMPRA (PDF)</a></strong></p>
            <p>Favor de confirmar recepción y fechas de entrega.</p>
          `
        });
      } catch(e) {
        console.error('Error enviando correo a proveedor:', e);
      }
    }

    return { message: 'OC enviada exitosamente', status: EstatusOC.ENVIADA };
  }
}
