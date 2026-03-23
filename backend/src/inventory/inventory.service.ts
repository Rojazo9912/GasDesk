import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoMovimiento } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findStock(tenantId: string, locationId?: string) {
    return this.prisma.inventory.findMany({
      where: {
        product: { tenantId },
        ...(locationId ? { locationId } : {}),
      },
      include: {
        product: {
          select: { id: true, nombre: true, unidad: true, categoria: true, stockMinimo: true },
        },
        location: { select: { id: true, nombre: true } },
      },
      orderBy: [{ location: { nombre: 'asc' } }, { product: { nombre: 'asc' } }],
    });
  }

  async findMovements(tenantId: string, locationId?: string, productId?: string) {
    return this.prisma.inventoryMovement.findMany({
      where: {
        product: { tenantId },
        ...(locationId ? { locationId } : {}),
        ...(productId ? { productId } : {}),
      },
      include: {
        product: { select: { nombre: true, unidad: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 300,
    });
  }

  async adjust(
    tenantId: string,
    productId: string,
    locationId: string,
    cantidad: number,
    notas?: string,
  ) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    await this.prisma.inventoryMovement.create({
      data: {
        productId,
        locationId,
        tipo: TipoMovimiento.AJUSTE,
        cantidad: Math.abs(cantidad),
        origenTipo: 'ajuste_manual',
        notas: notas ?? null,
      },
    });

    await this.prisma.inventory.upsert({
      where: { productId_locationId: { productId, locationId } },
      create: { productId, locationId, cantidad },
      update: { cantidad: { increment: cantidad } },
    });

    return { ok: true };
  }
}
