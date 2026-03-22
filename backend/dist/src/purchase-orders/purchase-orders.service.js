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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const resend_1 = require("resend");
let PurchaseOrdersService = class PurchaseOrdersService {
    prisma;
    resend;
    constructor(prisma) {
        this.prisma = prisma;
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_123');
    }
    async create(createDto, user) {
        const tx = await this.prisma.$transaction(async (prisma) => {
            const oc = await prisma.purchaseOrder.create({
                data: {
                    tenantId: user.tenantId,
                    solicitudId: createDto.solicitudId,
                    supplierId: createDto.supplierId,
                    locationId: createDto.locationId,
                    subtotal: createDto.subtotal,
                    iva: createDto.iva,
                    total: createDto.total,
                    fechaEntregaEsperada: createDto.fechaEntregaEsperada ? new Date(createDto.fechaEntregaEsperada) : null,
                    items: {
                        create: createDto.items.map(i => ({
                            productId: i.productId,
                            cantidadOrdenada: i.cantidadOrdenada,
                            precioUnitario: i.precioUnitario,
                            importe: i.importe
                        }))
                    }
                },
                include: { items: true, supplier: true }
            });
            return oc;
        });
        return tx;
    }
    async findAll(tenantId) {
        return this.prisma.purchaseOrder.findMany({
            where: { tenantId },
            include: {
                supplier: { select: { nombre: true } },
                location: { select: { nombre: true } },
                solicitud: { select: { id: true, notas: true } }
            },
            orderBy: { fechaEmision: 'desc' }
        });
    }
    async findOne(id, tenantId) {
        const oc = await this.prisma.purchaseOrder.findFirst({
            where: { id, tenantId },
            include: {
                supplier: true,
                location: true,
                solicitud: { select: { id: true, solicitante: { select: { nombre: true } } } },
                items: { include: { product: true } }
            }
        });
        if (!oc)
            throw new common_1.NotFoundException('OC no encontrada');
        return oc;
    }
    async sendToSupplier(id, pdfUrl, tenantId) {
        const oc = await this.findOne(id, tenantId);
        await this.prisma.purchaseOrder.update({
            where: { id },
            data: { estatus: client_1.EstatusOC.ENVIADA, pdfUrl }
        });
        if (process.env.RESEND_API_KEY && oc.supplier.contactoEmail) {
            try {
                await this.resend.emails.send({
                    from: 'GasDesk Compras <onboarding@resend.dev>',
                    to: oc.supplier.contactoEmail,
                    subject: `Orden de Compra / GasDesk`,
                    html: `
            <p>Hola ${oc.supplier.contactoNombre || oc.supplier.nombre},</p>
            <p>Adjunto a este mensaje encontrarás nuestra nueva Órden de Compra por un total de $${oc.total.toFixed(2)} MXN.</p>
            <p><strong><a href="${pdfUrl}" target="_blank">VER ÓRDEN DE COMPRA (PDF)</a></strong></p>
            <p>Favor de confirmar recepción y fechas de entrega.</p>
          `
                });
            }
            catch (e) {
                console.error('Error enviando correo a proveedor:', e);
            }
        }
        return { message: 'OC enviada exitosamente', status: client_1.EstatusOC.ENVIADA };
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map