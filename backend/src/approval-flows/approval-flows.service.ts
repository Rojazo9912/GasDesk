import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalFlowDto } from './dto/create-approval-flow.dto';
import { Rol } from '@prisma/client';

@Injectable()
export class ApprovalFlowsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateApprovalFlowDto, tenantId: string) {
    // 1. Validar que el usuario aprobador existe y pertenece al tenant
    const aprobador = await this.prisma.user.findFirst({
      where: { id: createDto.aprobadorId, tenantId, activo: true }
    });
    if (!aprobador) {
      throw new BadRequestException('El usuario aprobador no existe o no pertenece a la empresa');
    }

    // 2. Determinar el nivelOrden automático (el último + 1)
    const lastFlow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId, activo: true },
      orderBy: { nivelOrden: 'desc' }
    });
    const nivelOrden = lastFlow ? lastFlow.nivelOrden + 1 : 1;

    return this.prisma.approvalFlow.create({
      data: {
        ...createDto,
        tenantId,
        nivelOrden,
      },
      include: {
        aprobador: { select: { nombre: true, email: true, rol: true } }
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.approvalFlow.findMany({
      where: { tenantId, activo: true },
      orderBy: { nivelOrden: 'asc' },
      include: {
        aprobador: { select: { nombre: true, email: true, rol: true } }
      }
    });
  }

  async remove(id: string, tenantId: string) {
    const flow = await this.prisma.approvalFlow.findFirst({ where: { id, tenantId } });
    if (!flow) throw new NotFoundException('Flujo de aprobación no encontrado');
    
    return this.prisma.approvalFlow.update({
      where: { id },
      data: { activo: false }
    });
  }

  async reorderLevels(flowIds: string[], tenantId: string) {
    if (!flowIds || flowIds.length === 0) return [];

    // Validar que el último ID tiene el rol COMPRAS
    const lastId = flowIds[flowIds.length - 1];
    const lastFlowInfo = await this.prisma.approvalFlow.findFirst({
      where: { id: lastId, tenantId },
      include: { aprobador: true }
    });

    if (!lastFlowInfo) {
      throw new BadRequestException('El último nivel no es válido');
    }
    
    // Regla de negocio: El nivel de Compras siempre es el último
    if (lastFlowInfo.aprobador.rol !== Rol.COMPRAS) {
      throw new BadRequestException('Operación denegada. El último nivel de aprobación siempre debe ser de un usuario con rol COMPRAS.');
    }

    // Ejecutar actualización en transacción
    const queries = flowIds.map((id, index) => {
      const nuevoOrden = index + 1;
      return this.prisma.approvalFlow.update({
        where: { id },
        data: { nivelOrden: nuevoOrden }
      });
    });

    await this.prisma.$transaction(queries);
    return this.findAll(tenantId);
  }
}
