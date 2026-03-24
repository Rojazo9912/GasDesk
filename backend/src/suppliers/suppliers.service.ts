import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateSupplierPriceDto } from './dto/create-supplier-price.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateSupplierDto, tenantId: string) {
    const existing = await this.prisma.supplier.findUnique({
      where: { tenantId_rfc: { tenantId, rfc: createDto.rfc } }
    });
    if (existing) throw new ConflictException('Ya existe un proveedor con este RFC en la empresa');

    return this.prisma.supplier.create({
      data: { ...createDto, tenantId }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.supplier.findMany({
      where: { tenantId, activo: true },
      orderBy: { nombre: 'asc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const supp = await this.prisma.supplier.findFirst({
      where: { id, tenantId }
    });
    if (!supp) throw new NotFoundException('Proveedor no encontrado');
    return supp;
  }

  async update(id: string, updateDto: UpdateSupplierDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.supplier.update({
      where: { id },
      data: updateDto
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.supplier.update({
      where: { id },
      data: { activo: false }
    });
  }

  // Métodos de Precios
  async addPrice(supplierId: string, dto: CreateSupplierPriceDto, tenantId: string) {
    return (this.prisma as any).supplierPrice.create({
      data: {
        ...dto,
        supplierId,
        tenantId
      }
    });
  }

  async getPrices(supplierId: string, tenantId: string) {
    return (this.prisma as any).supplierPrice.findMany({
      where: { supplierId, tenantId },
      include: { product: true },
      orderBy: { fecha: 'desc' }
    });
  }

  async getLatestPrice(supplierId: string, productId: string, tenantId: string) {
    return (this.prisma as any).supplierPrice.findFirst({
      where: { supplierId, productId, tenantId },
      orderBy: { fecha: 'desc' }
    });
  }
}
