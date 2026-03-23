import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoMovimiento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findStock(tenantId: string, departmentId?: string) {
    return this.prisma.departmentInventory.findMany({
      where: {
        tenantId,
        ...(departmentId ? { departmentId } : {}),
      },
      include: {
        product: {
          select: { id: true, nombre: true, unidad: true, categoria: true },
        },
        department: { select: { id: true, nombre: true } },
      },
      orderBy: [{ department: { nombre: 'asc' } }, { product: { nombre: 'asc' } }],
    });
  }

  async findMovements(tenantId: string, departmentId?: string, productId?: string) {
    return this.prisma.departmentMovement.findMany({
      where: {
        tenantId,
        ...(departmentId ? { departmentId } : {}),
        ...(productId ? { productId } : {}),
      },
      include: {
        product: { select: { nombre: true, unidad: true } },
        department: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 300,
    });
  }

  async adjust(
    tenantId: string,
    departmentId: string,
    productId: string,
    cantidad: number,
    notas?: string,
  ) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado.');

    const department = await this.prisma.department.findFirst({ where: { id: departmentId, tenantId } });
    if (!department) throw new NotFoundException('Departamento no encontrado.');

    await this.prisma.departmentMovement.create({
      data: {
        tenantId,
        departmentId,
        productId,
        tipo: cantidad >= 0 ? TipoMovimiento.ENTRADA : TipoMovimiento.SALIDA,
        cantidad: Math.abs(cantidad),
        notas: notas ?? null,
      },
    });

    await this.prisma.departmentInventory.upsert({
      where: { departmentId_productId: { departmentId, productId } },
      create: { tenantId, departmentId, productId, cantidad },
      update: { cantidad: { increment: cantidad } },
    });

    return { ok: true };
  }

  async setStockMinimo(
    tenantId: string,
    departmentId: string,
    productId: string,
    stockMinimo: number,
  ) {
    const existing = await this.prisma.departmentInventory.findUnique({
      where: { departmentId_productId: { departmentId, productId } },
    });

    if (!existing) {
      await this.prisma.departmentInventory.create({
        data: { tenantId, departmentId, productId, cantidad: 0, stockMinimo },
      });
    } else {
      await this.prisma.departmentInventory.update({
        where: { departmentId_productId: { departmentId, productId } },
        data: { stockMinimo },
      });
    }

    return { ok: true };
  }
}
