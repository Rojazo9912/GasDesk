import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto, tenantId: string) {
    if (!tenantId) {
      throw new ForbiddenException('Se requiere una empresa para crear sucursales');
    }

    return this.prisma.location.create({
      data: {
        ...createLocationDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId?: string) {
    const whereClause: any = { activo: true };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return this.prisma.location.findMany({
      where: whereClause,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string, tenantId?: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }

    if (tenantId && location.tenantId !== tenantId) {
      throw new ForbiddenException('No tienes permisos para ver esta sucursal');
    }

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto, tenantId?: string) {
    await this.findOne(id, tenantId);

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: string, tenantId?: string) {
    await this.findOne(id, tenantId);
    
    // Soft delete actualizando 'activo'
    return this.prisma.location.update({
      where: { id },
      data: { activo: false },
    });
  }
}
