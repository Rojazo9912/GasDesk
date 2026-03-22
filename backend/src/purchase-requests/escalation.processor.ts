import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Processor('escalations')
export class EscalationProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('check-timeout')
  async handleTimeout(job: Job) {
    const { solicitudId, nivelActual } = job.data;
    console.log(`[JOB] Verificando timeout para solicitud ${solicitudId} en nivel ${nivelActual}`);
    // Aquí implementaremos la lógica de escalado automático más adelante
  }
}
