import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { EstatusSC } from '@prisma/client';
import { Resend } from 'resend';

@Injectable()
export class PurchaseRequestsService {
  private resend: Resend;

  constructor(private readonly prisma: PrismaService) {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  private async notifyUser(email: string, subject: string, message: string) {
    if (!process.env.RESEND_API_KEY) return;
    try {
      await this.resend.emails.send({
        from: 'GasDesk <onboarding@resend.dev>',
        to: email,
        subject,
        html: `<p>${message}</p>`
      });
    } catch (error) {
      console.error('Error enviando email:', error);
    }
  }

  async create(createDto: CreatePurchaseRequestDto, user: any) {
    const { items, locationId, notas, adjuntoUrl } = createDto;
    
    // Obtener primer nivel de aprobacion
    const baseFlow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId: user.tenantId, activo: true, nivelOrden: 1 },
      include: { aprobador: true }
    });

    if (!baseFlow) {
      throw new BadRequestException('No hay un flujo de aprobación inicial activo (Nivel 1).');
    }

    const estatusInicial = EstatusSC.PENDIENTE_NIVEL_1;

    const req = await this.prisma.purchaseRequest.create({
      data: {
        tenantId: user.tenantId,
        solicitanteId: user.id,
        locationId,
        notas,
        adjuntoUrl,
        estatus: estatusInicial,
        nivelActual: 1,
        items: {
          create: items.map(i => ({
            productId: i.productoId,
            cantidadSolicitada: i.cantidad,
            justificacion: i.justificacion
          }))
        },
        historial: {
          create: {
            flowId: baseFlow.id,
            aprobadorId: baseFlow.aprobadorId,
            accion: 'creado',
            comentario: 'Solicitud creada automáticamente'
          }
        }
      },
      include: { items: true, historial: true }
    });

    if (baseFlow.aprobador.email) {
      this.notifyUser(
        baseFlow.aprobador.email, 
        'Nueva Solicitud Pendiente', 
        `Tienes una nueva Solicitud de Compra (ID: ${req.id}) pendiente de autorización.`
      );
    }

    return req;
  }

  async findAll(tenantId: string) {
    return this.prisma.purchaseRequest.findMany({
      where: { tenantId },
      include: {
        solicitante: { select: { nombre: true, email: true } },
        location: { select: { nombre: true, tipo: true } },
        items: { include: { product: true } }
      },
      orderBy: { creadoEn: 'desc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const req = await this.prisma.purchaseRequest.findFirst({
      where: { id, tenantId },
      include: {
        solicitante: { select: { id: true, nombre: true, email: true, rol: true } },
        location: true,
        items: { include: { product: true } },
        historial: {
          include: { 
            aprobador: { select: { nombre: true, rol: true } },
            flow: { select: { nivelOrden: true, nombre: true } }
          },
          orderBy: { fecha: 'desc' }
        }
      }
    });

    if (!req) throw new NotFoundException('Solicitud de compra no encontrada');
    return req;
  }

  // Avanzar un nivel o completarlo (hasta COMPRAS)
  async approve(id: string, comentario: string | undefined, user: any) {
    const solicitud = await this.findOne(id, user.tenantId);
    
    // Obtener flow actual basado en nivelActual
    const currentFlow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId: user.tenantId, activo: true, nivelOrden: solicitud.nivelActual },
      include: { aprobador: true }
    });

    if (!currentFlow) throw new BadRequestException('El flujo actual ya no es válido.');
    
    // Validar autorización
    if (currentFlow.aprobadorId !== user.id && user.rol !== 'SUPER_ADMIN') {
      throw new ForbiddenException('No tienes permisos para aprobar este nivel.');
    }

    // Identificar siguiente nivel
    const nextFlow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId: user.tenantId, activo: true, nivelOrden: solicitud.nivelActual + 1 },
      include: { aprobador: true }
    });

    const isLastLevel = !nextFlow;
    
    let nuevoEstatus = isLastLevel ? EstatusSC.PENDIENTE_COMPRAS : (`PENDIENTE_NIVEL_${solicitud.nivelActual + 1}` as EstatusSC);
    let nuevoNivel = isLastLevel ? solicitud.nivelActual : (solicitud.nivelActual + 1);

    const tx = await this.prisma.$transaction(async (prisma) => {
      // 1. Guardar historial (registro de que aprobó)
      await prisma.approvalHistory.create({
        data: {
          solicitudId: id,
          flowId: currentFlow.id,
          aprobadorId: user.id,
          accion: 'aprobado',
          comentario: comentario || 'Aprobado'
        }
      });

      // 2. Si no es el ultimo nivel, crear historial inicial para quien lo debe recibir
      if (nextFlow) {
        await prisma.approvalHistory.create({
          data: {
            solicitudId: id,
            flowId: nextFlow.id,
            aprobadorId: nextFlow.aprobadorId,
            accion: 'recibido_escalacion',
            comentario: 'Solicitud transferida al siguiente nivel'
          }
        });
      }

      // 3. Actualizar Maestro
      return prisma.purchaseRequest.update({
        where: { id },
        data: {
          estatus: nuevoEstatus,
          nivelActual: nuevoNivel
        }
      });
    });

    if (nextFlow && nextFlow.aprobador.email) {
      this.notifyUser(nextFlow.aprobador.email, 'Solicitud Avanzada', 'Una solicitud requiere tu aprobación ahora.');
    }

    return tx;
  }

  async reject(id: string, comentario: string, user: any) {
    const solicitud = await this.findOne(id, user.tenantId);
    
    const currentFlow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId: user.tenantId, activo: true, nivelOrden: solicitud.nivelActual }
    });

    if (!currentFlow || (currentFlow.aprobadorId !== user.id && user.rol !== 'SUPER_ADMIN')) {
      throw new ForbiddenException('No tienes permisos para rechazar.');
    }

    if (!comentario) {
      throw new BadRequestException('Se requiere un comentario al rechazar.');
    }

    const tx = await this.prisma.$transaction(async (prisma) => {
      await prisma.approvalHistory.create({
        data: {
          solicitudId: id,
          flowId: currentFlow.id,
          aprobadorId: user.id,
          accion: 'rechazado',
          comentario
        }
      });

      return prisma.purchaseRequest.update({
        where: { id },
        data: {
          estatus: EstatusSC.RECHAZADA
        }
      });
    });

    if (solicitud.solicitante.email) {
      this.notifyUser(solicitud.solicitante.email, 'Solicitud Rechazada', `Tu solicitud ${id} fue rechazada por este motivo: ${comentario}`);
    }

    return tx;
  }

  async markAsCompleted(id: string, user: any) {
      if (user.rol !== 'COMPRAS' && user.rol !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Sólo Compras puede finalizar la solicitud');
      }
      return this.prisma.purchaseRequest.update({
        where: { id, tenantId: user.tenantId },
        data: { estatus: EstatusSC.COMPLETADA }
      });
  }
}
