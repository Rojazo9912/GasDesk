import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { EstatusSC } from '@prisma/client';
import { Resend } from 'resend';
import { NotificationsService } from '../notifications/notifications.service';
import { BudgetsService } from '../budgets/budgets.service';

@Injectable()
export class PurchaseRequestsService {
  private resend: Resend;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly budgetsService: BudgetsService,
    @Optional() @InjectQueue('escalations') private escalationsQueue?: Queue,
  ) {
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

  private async scheduleEscalation(solicitudId: string, nivelActual: number, tiempoLimiteHrs: number | null) {
    if (!this.escalationsQueue || !tiempoLimiteHrs) return;
    await this.escalationsQueue.add(
      'check-timeout',
      { solicitudId, nivelActual },
      { delay: tiempoLimiteHrs * 60 * 60 * 1000 },
    );
  }

  async create(createDto: CreatePurchaseRequestDto, user: any) {
    const { items, locationId, notas, adjuntoUrl } = createDto;

    const baseFlow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId: user.tenantId, activo: true, nivelOrden: 1 },
      include: { aprobador: true }
    });

    if (!baseFlow) {
      throw new BadRequestException('No hay un flujo de aprobación inicial activo (Nivel 1).');
    }

    const req = await this.prisma.purchaseRequest.create({
      data: {
        tenantId: user.tenantId,
        solicitanteId: user.id,
        locationId,
        notas,
        adjuntoUrl,
        estatus: EstatusSC.PENDIENTE_NIVEL_1,
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

    const reqAny = req as any;

    // Notificación in-app al aprobador
    this.notificationsService.create(
      baseFlow.aprobadorId,
      user.tenantId,
      'Nueva Solicitud Pendiente',
      `Tienes una nueva Solicitud de Compra (SC-${reqAny.folio}) pendiente de autorización.`,
      'info',
    ).catch(() => {});

    if (baseFlow.aprobador.email) {
      this.notifyUser(
        baseFlow.aprobador.email,
        'Nueva Solicitud Pendiente',
        `Tienes una nueva Solicitud de Compra (SC-${reqAny.folio}) pendiente de autorización.`
      );
    }

    await this.scheduleEscalation(req.id, 1, baseFlow.tiempoLimiteHrs);

    // Verificar presupuesto (no bloqueante)
    const budgetCheck = await this.budgetsService.checkBudget(user.tenantId, locationId, 0);

    return { ...req, alertaPresupuesto: budgetCheck.alertaPresupuesto };
  }

  async findAll(tenantId: string, filters?: { estatus?: string; locationId?: string; desde?: string; hasta?: string }) {
    const where: any = { tenantId };

    if (filters?.estatus) {
      where.estatus = filters.estatus;
    }
    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }
    if (filters?.desde || filters?.hasta) {
      where.creadoEn = {};
      if (filters.desde) where.creadoEn.gte = new Date(filters.desde);
      if (filters.hasta) where.creadoEn.lte = new Date(filters.hasta);
    }

    return this.prisma.purchaseRequest.findMany({
      where,
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

  async approve(id: string, comentario: string | undefined, user: any) {
    const solicitud = await this.findOne(id, user.tenantId);

    const currentFlow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId: user.tenantId, activo: true, nivelOrden: solicitud.nivelActual },
      include: { aprobador: true }
    });

    if (!currentFlow) throw new BadRequestException('El flujo actual ya no es válido.');

    if (currentFlow.aprobadorId !== user.id && user.rol !== 'SUPER_ADMIN') {
      throw new ForbiddenException('No tienes permisos para aprobar este nivel.');
    }

    const nextFlow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId: user.tenantId, activo: true, nivelOrden: solicitud.nivelActual + 1 },
      include: { aprobador: true }
    });

    const isLastLevel = !nextFlow;
    const nuevoEstatus = isLastLevel ? EstatusSC.PENDIENTE_COMPRAS : (`PENDIENTE_NIVEL_${solicitud.nivelActual + 1}` as EstatusSC);
    const nuevoNivel = isLastLevel ? solicitud.nivelActual : (solicitud.nivelActual + 1);

    const tx = await this.prisma.$transaction(async (prisma) => {
      await prisma.approvalHistory.create({
        data: {
          solicitudId: id,
          flowId: currentFlow.id,
          aprobadorId: user.id,
          accion: 'aprobado',
          comentario: comentario || 'Aprobado'
        }
      });

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

      return prisma.purchaseRequest.update({
        where: { id },
        data: { estatus: nuevoEstatus, nivelActual: nuevoNivel }
      });
    });

    if (nextFlow) {
      // Notificación in-app al siguiente aprobador
      this.notificationsService.create(
        nextFlow.aprobadorId,
        user.tenantId,
        'Solicitud Avanzada',
        `La SC-${(solicitud as any).folio} requiere tu aprobación.`,
        'info',
      ).catch(() => {});

      if (nextFlow.aprobador.email) {
        this.notifyUser(nextFlow.aprobador.email, 'Solicitud Avanzada', 'Una solicitud requiere tu aprobación ahora.');
      }
      await this.scheduleEscalation(id, nuevoNivel, nextFlow.tiempoLimiteHrs);
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
        data: { estatus: EstatusSC.RECHAZADA }
      });
    });

    // Notificación in-app al solicitante
    this.notificationsService.create(
      solicitud.solicitanteId,
      user.tenantId,
      'Solicitud Rechazada',
      `Tu solicitud SC-${(solicitud as any).folio} fue rechazada: ${comentario}`,
      'error',
    ).catch(() => {});

    if (solicitud.solicitante.email) {
      this.notifyUser(
        solicitud.solicitante.email,
        'Solicitud Rechazada',
        `Tu solicitud SC-${(solicitud as any).folio} fue rechazada: ${comentario}`
      );
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
