import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceptionDto } from './dto/create-reception.dto';
import { TipoMovimiento, EstatusOC } from '@prisma/client';

@Injectable()
export class ReceptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReceptionDto, almacenistaId: string, tenantId: string) {
    const oc = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.ordenId, tenantId },
      include: { items: true },
    });
    if (!oc) throw new NotFoundException('Orden de compra no encontrada.');

    const reception = await this.prisma.reception.create({
      data: {
        ordenId: dto.ordenId,
        facturaId: dto.facturaId ?? null,
        almacenistaId,
        notas: dto.notas ?? null,
        items: {
          create: dto.items.map(item => ({
            productId: item.productId,
            cantidadRecibida: item.cantidadRecibida,
            notas: item.notas ?? null,
          })),
        },
      },
      include: { items: true },
    });

    // Update inventory for each received item
    for (const item of reception.items) {
      await this.prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          locationId: oc.locationId,
          tipo: TipoMovimiento.ENTRADA,
          cantidad: item.cantidadRecibida,
          origenTipo: 'recepcion',
          origenId: reception.id,
          notas: item.notas ?? null,
        },
      });

      await this.prisma.inventory.upsert({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: oc.locationId,
          },
        },
        create: {
          productId: item.productId,
          locationId: oc.locationId,
          cantidad: item.cantidadRecibida,
        },
        update: {
          cantidad: { increment: item.cantidadRecibida },
        },
      });
    }

    // Update OC status: COMPLETADA if all items fully received, else RECIBIDA_PARCIAL
    const allReceived = await this.prisma.receptionItem.findMany({
      where: { recepcion: { ordenId: dto.ordenId } },
    });

    const receivedByProduct = allReceived.reduce<Record<string, number>>((acc, r) => {
      acc[r.productId] = (acc[r.productId] || 0) + r.cantidadRecibida;
      return acc;
    }, {});

    const allComplete = oc.items.every(
      ocItem => (receivedByProduct[ocItem.productId] || 0) >= ocItem.cantidadOrdenada,
    );

    await this.prisma.purchaseOrder.update({
      where: { id: dto.ordenId },
      data: { estatus: allComplete ? EstatusOC.COMPLETADA : EstatusOC.RECIBIDA_PARCIAL },
    });

    return reception;
  }

  async findByOrden(ordenId: string, tenantId: string) {
    const oc = await this.prisma.purchaseOrder.findFirst({ where: { id: ordenId, tenantId } });
    if (!oc) throw new NotFoundException('Orden no encontrada.');

    return this.prisma.reception.findMany({
      where: { ordenId },
      include: {
        items: {
          include: {
            product: { select: { nombre: true, unidad: true } },
          },
        },
        almacenista: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }
}
