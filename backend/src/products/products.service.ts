import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Se requiere una empresa para crear productos');
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId?: string) {
    const whereClause: any = { activo: true };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return this.prisma.product.findMany({
      where: whereClause,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string, tenantId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    if (tenantId && product.tenantId !== tenantId) {
      throw new ForbiddenException('No tienes permisos para ver este producto');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, tenantId?: string) {
    await this.findOne(id, tenantId);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, tenantId?: string) {
    await this.findOne(id, tenantId);
    
    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: { activo: false },
    });
  }
}
