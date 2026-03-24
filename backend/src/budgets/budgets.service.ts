import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBudgetDto) {
    const existing = await this.prisma.budget.findUnique({
      where: {
        tenantId_locationId_anio_mes: {
          tenantId,
          locationId: dto.locationId,
          anio: dto.anio,
          mes: dto.mes,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un presupuesto para esa sucursal en ${dto.mes}/${dto.anio}`,
      );
    }

    return this.prisma.budget.create({
      data: {
        tenantId,
        locationId: dto.locationId,
        anio: dto.anio,
        mes: dto.mes,
        montoAsignado: dto.montoAsignado,
      },
      include: { location: { select: { nombre: true } } },
    });
  }

  async findAll(tenantId: string, anio?: number, mes?: number, locationId?: string) {
    return this.prisma.budget.findMany({
      where: {
        tenantId,
        ...(anio && { anio }),
        ...(mes && { mes }),
        ...(locationId && { locationId }),
      },
      include: { location: { select: { nombre: true } } },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }, { location: { nombre: 'asc' } }],
    });
  }

  async update(id: string, tenantId: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findFirst({ where: { id, tenantId } });
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');

    return this.prisma.budget.update({
      where: { id },
      data: { montoAsignado: dto.montoAsignado },
      include: { location: { select: { nombre: true } } },
    });
  }

  async remove(id: string, tenantId: string) {
    const budget = await this.prisma.budget.findFirst({ where: { id, tenantId } });
    if (!budget) throw new NotFoundException('Presupuesto no encontrado');
    await this.prisma.budget.delete({ where: { id } });
    return { ok: true };
  }

  /** Verifica si hay presupuesto disponible para el mes actual */
  async checkBudget(
    tenantId: string,
    locationId: string,
    monto: number,
  ): Promise<{ disponible: boolean; restante: number; alertaPresupuesto?: string }> {
    const now = new Date();
    const budget = await this.prisma.budget.findUnique({
      where: {
        tenantId_locationId_anio_mes: {
          tenantId,
          locationId,
          anio: now.getFullYear(),
          mes: now.getMonth() + 1,
        },
      },
    });

    if (!budget) return { disponible: true, restante: 0 };

    const restante = budget.montoAsignado - budget.montoEjercido;
    const disponible = restante >= monto;
    const alertaPresupuesto = disponible
      ? undefined
      : `La solicitud excede el presupuesto disponible ($${restante.toFixed(2)} restante de $${budget.montoAsignado.toFixed(2)})`;

    return { disponible, restante, alertaPresupuesto };
  }

  /** Incrementa el monto ejercido (llamado al aprobar una OC) */
  async incrementarEjercido(tenantId: string, locationId: string, monto: number) {
    const now = new Date();
    await this.prisma.budget.updateMany({
      where: {
        tenantId,
        locationId,
        anio: now.getFullYear(),
        mes: now.getMonth() + 1,
      },
      data: { montoEjercido: { increment: monto } },
    });
  }
}
