import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const { adminUser, ...tenantData } = createTenantDto;

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { rfc: tenantData.rfc },
    });
    if (existingTenant) {
      throw new ConflictException('Ya existe una empresa con este RFC');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: adminUser.email },
    });
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con este email');
    }

    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          nombre: tenantData.nombre,
          rfc: tenantData.rfc,
          logo: tenantData.logo,
          plan: tenantData.plan ?? 'basico',
        },
      });

      await tx.user.create({
        data: {
          tenantId: tenant.id,
          nombre: adminUser.nombre,
          email: adminUser.email,
          password: hashedPassword,
          rol: Rol.ADMIN,
        },
      });

      return { ...tenant, adminEmail: adminUser.email };
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { creadoEn: 'desc' },
      include: {
        _count: {
          select: { usuarios: true, sucursales: true, departamentos: true },
        },
      },
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
    await this.findOne(id);

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
