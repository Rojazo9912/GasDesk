import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';

@Injectable()
export class PerfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.perfil.findMany({
      where: { tenantId, activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  create(tenantId: string, dto: CreatePerfilDto) {
    return this.prisma.perfil.create({
      data: { ...dto, tenantId },
    });
  }

  async update(tenantId: string, id: string, dto: Partial<CreatePerfilDto>) {
    const perfil = await this.prisma.perfil.findFirst({ where: { id, tenantId } });
    if (!perfil) throw new NotFoundException('Perfil no encontrado.');
    return this.prisma.perfil.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const perfil = await this.prisma.perfil.findFirst({ where: { id, tenantId } });
    if (!perfil) throw new NotFoundException('Perfil no encontrado.');
    return this.prisma.perfil.update({ where: { id }, data: { activo: false } });
  }
}
