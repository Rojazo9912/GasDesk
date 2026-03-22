import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({
      where: { rfc: createTenantDto.rfc },
    });

    if (existing) {
      throw new ConflictException('Ya existe una empresa con este RFC');
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findOne(id); // verifica si existe

    if (updateTenantDto.rfc) {
      const existing = await this.prisma.tenant.findUnique({
        where: { rfc: updateTenantDto.rfc },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe otra empresa con este RFC');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }
}
