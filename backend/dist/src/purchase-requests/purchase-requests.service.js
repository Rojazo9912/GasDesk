"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const resend_1 = require("resend");
let PurchaseRequestsService = class PurchaseRequestsService {
    prisma;
    resend;
    constructor(prisma) {
        this.prisma = prisma;
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_123');
    }
    async notifyUser(email, subject, message) {
        if (!process.env.RESEND_API_KEY)
            return;
        try {
            await this.resend.emails.send({
                from: 'GasDesk <onboarding@resend.dev>',
                to: email,
                subject,
                html: `<p>${message}</p>`
            });
        }
        catch (error) {
            console.error('Error enviando email:', error);
        }
    }
    async create(createDto, user) {
        const { items, locationId, notas, adjuntoUrl } = createDto;
        const baseFlow = await this.prisma.approvalFlow.findFirst({
            where: { tenantId: user.tenantId, activo: true, nivelOrden: 1 },
            include: { aprobador: true }
        });
        if (!baseFlow) {
            throw new common_1.BadRequestException('No hay un flujo de aprobación inicial activo (Nivel 1).');
        }
        const estatusInicial = client_1.EstatusSC.PENDIENTE_NIVEL_1;
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
            this.notifyUser(baseFlow.aprobador.email, 'Nueva Solicitud Pendiente', `Tienes una nueva Solicitud de Compra (ID: ${req.id}) pendiente de autorización.`);
        }
        return req;
    }
    async findAll(tenantId) {
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
    async findOne(id, tenantId) {
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
        if (!req)
            throw new common_1.NotFoundException('Solicitud de compra no encontrada');
        return req;
    }
    async approve(id, comentario, user) {
        const solicitud = await this.findOne(id, user.tenantId);
        const currentFlow = await this.prisma.approvalFlow.findFirst({
            where: { tenantId: user.tenantId, activo: true, nivelOrden: solicitud.nivelActual },
            include: { aprobador: true }
        });
        if (!currentFlow)
            throw new common_1.BadRequestException('El flujo actual ya no es válido.');
        if (currentFlow.aprobadorId !== user.id && user.rol !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('No tienes permisos para aprobar este nivel.');
        }
        const nextFlow = await this.prisma.approvalFlow.findFirst({
            where: { tenantId: user.tenantId, activo: true, nivelOrden: solicitud.nivelActual + 1 },
            include: { aprobador: true }
        });
        const isLastLevel = !nextFlow;
        let nuevoEstatus = isLastLevel ? client_1.EstatusSC.PENDIENTE_COMPRAS : `PENDIENTE_NIVEL_${solicitud.nivelActual + 1}`;
        let nuevoNivel = isLastLevel ? solicitud.nivelActual : (solicitud.nivelActual + 1);
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
    async reject(id, comentario, user) {
        const solicitud = await this.findOne(id, user.tenantId);
        const currentFlow = await this.prisma.approvalFlow.findFirst({
            where: { tenantId: user.tenantId, activo: true, nivelOrden: solicitud.nivelActual }
        });
        if (!currentFlow || (currentFlow.aprobadorId !== user.id && user.rol !== 'SUPER_ADMIN')) {
            throw new common_1.ForbiddenException('No tienes permisos para rechazar.');
        }
        if (!comentario) {
            throw new common_1.BadRequestException('Se requiere un comentario al rechazar.');
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
                    estatus: client_1.EstatusSC.RECHAZADA
                }
            });
        });
        if (solicitud.solicitante.email) {
            this.notifyUser(solicitud.solicitante.email, 'Solicitud Rechazada', `Tu solicitud ${id} fue rechazada por este motivo: ${comentario}`);
        }
        return tx;
    }
    async markAsCompleted(id, user) {
        if (user.rol !== 'COMPRAS' && user.rol !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Sólo Compras puede finalizar la solicitud');
        }
        return this.prisma.purchaseRequest.update({
            where: { id, tenantId: user.tenantId },
            data: { estatus: client_1.EstatusSC.COMPLETADA }
        });
    }
};
exports.PurchaseRequestsService = PurchaseRequestsService;
exports.PurchaseRequestsService = PurchaseRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseRequestsService);
//# sourceMappingURL=purchase-requests.service.js.map