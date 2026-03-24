import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

@Processor('escalations')
export class EscalationProcessor {
  private resend: Resend;

  constructor(private readonly prisma: PrismaService) {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  private async notify(email: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) return;
    try {
      await this.resend.emails.send({
        from: 'GasDesk <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });
    } catch (err) {
      console.error('[EscalationProcessor] Error enviando email:', err);
    }
  }

  @Process('check-timeout')
  async handleTimeout(job: Job) {
    const { solicitudId, nivelActual } = job.data;
    console.log(`[JOB] Verificando timeout para solicitud ${solicitudId} en nivel ${nivelActual}`);

    const solicitud = await this.prisma.purchaseRequest.findUnique({
      where: { id: solicitudId },
      include: { solicitante: { select: { nombre: true, email: true } } },
    });

    // Si ya no está en el mismo nivel, el job está obsoleto
    if (!solicitud || solicitud.nivelActual !== nivelActual) return;
    if (!solicitud.estatus.startsWith('PENDIENTE_NIVEL')) return;

    const flow = await this.prisma.approvalFlow.findFirst({
      where: { tenantId: solicitud.tenantId, nivelOrden: nivelActual, activo: true },
      include: {
        aprobador: { select: { nombre: true, email: true } },
        alterno: { select: { id: true, nombre: true, email: true } },
      },
    });

    if (!flow) return;

    if (flow.alterno && flow.alternoId) {
      // Escalar al aprobador alterno: registrar en historial y notificar
      await this.prisma.approvalHistory.create({
        data: {
          solicitudId,
          flowId: flow.id,
          aprobadorId: flow.alternoId,
          accion: 'escalado',
          comentario: `Tiempo límite superado. Escalado al aprobador alterno: ${flow.alterno.nombre}`,
        },
      });

      if (flow.alterno.email) {
        await this.notify(
          flow.alterno.email,
          'Solicitud Escalada — Requiere tu Aprobación',
          `<p>La solicitud <strong>SC-${solicitud.folio}</strong> fue escalada a ti porque el aprobador principal superó el tiempo límite.</p>
           <p>Por favor ingresa a GasDesk para revisarla.</p>`,
        );
      }
      console.log(`[JOB] Solicitud ${solicitudId} escalada al alterno: ${flow.alterno.nombre}`);
    } else {
      // Sin alterno: enviar recordatorio al aprobador original
      if (flow.aprobador.email) {
        await this.notify(
          flow.aprobador.email,
          'Recordatorio: Solicitud Pendiente de Aprobación',
          `<p>La solicitud <strong>SC-${solicitud.folio}</strong> lleva más tiempo del permitido esperando tu aprobación.</p>
           <p>Por favor ingresa a GasDesk para resolverla.</p>`,
        );
      }

      // Notificar también a los SUPER_ADMIN del tenant
      const admins = await this.prisma.user.findMany({
        where: { tenantId: solicitud.tenantId, rol: 'SUPER_ADMIN', activo: true },
        select: { email: true, nombre: true },
      });
      for (const admin of admins) {
        if (admin.email) {
          await this.notify(
            admin.email,
            'Alerta: Solicitud Bloqueada por Timeout',
            `<p>La solicitud <strong>SC-${solicitud.folio}</strong> lleva más del tiempo permitido sin aprobarse en el Nivel ${nivelActual}.</p>
             <p>El aprobador asignado es <strong>${flow.aprobador.nombre}</strong>. No existe aprobador alterno.</p>`,
          );
        }
      }
      console.log(`[JOB] Recordatorio enviado para solicitud ${solicitudId} — sin alterno disponible`);
    }
  }
}
