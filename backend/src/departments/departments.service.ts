import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.department.findMany({
      where: { tenantId, activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async create(tenantId: string, dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: { ...dto, tenantId },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDepartmentDto) {
    const dep = await this.prisma.department.findFirst({ where: { id, tenantId } });
    if (!dep) throw new NotFoundException('Departamento no encontrado.');
    return this.prisma.department.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const dep = await this.prisma.department.findFirst({ where: { id, tenantId } });
    if (!dep) throw new NotFoundException('Departamento no encontrado.');
    return this.prisma.department.update({ where: { id }, data: { activo: false } });
  }
}
