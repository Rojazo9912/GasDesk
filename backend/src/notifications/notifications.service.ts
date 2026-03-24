import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async create(
    userId: string,
    tenantId: string,
    titulo: string,
    mensaje: string,
    tipo: string = 'info',
  ) {
    const notif = await this.prisma.notification.create({
      data: { userId, tenantId, titulo, mensaje, tipo },
    });
    // Emitir en tiempo real
    this.gateway.sendToUser(userId, notif);
    return notif;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { creadaEn: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { leida: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, leida: false },
      data: { leida: true },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, leida: false } });
  }
}
