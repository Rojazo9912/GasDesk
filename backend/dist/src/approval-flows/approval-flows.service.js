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
exports.ApprovalFlowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ApprovalFlowsService = class ApprovalFlowsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto, tenantId) {
        const aprobador = await this.prisma.user.findFirst({
            where: { id: createDto.aprobadorId, tenantId, activo: true }
        });
        if (!aprobador) {
            throw new common_1.BadRequestException('El usuario aprobador no existe o no pertenece a la empresa');
        }
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
    async findAll(tenantId) {
        return this.prisma.approvalFlow.findMany({
            where: { tenantId, activo: true },
            orderBy: { nivelOrden: 'asc' },
            include: {
                aprobador: { select: { nombre: true, email: true, rol: true } }
            }
        });
    }
    async remove(id, tenantId) {
        const flow = await this.prisma.approvalFlow.findFirst({ where: { id, tenantId } });
        if (!flow)
            throw new common_1.NotFoundException('Flujo de aprobación no encontrado');
        return this.prisma.approvalFlow.update({
            where: { id },
            data: { activo: false }
        });
    }
    async reorderLevels(flowIds, tenantId) {
        if (!flowIds || flowIds.length === 0)
            return [];
        const lastId = flowIds[flowIds.length - 1];
        const lastFlowInfo = await this.prisma.approvalFlow.findFirst({
            where: { id: lastId, tenantId },
            include: { aprobador: true }
        });
        if (!lastFlowInfo) {
            throw new common_1.BadRequestException('El último nivel no es válido');
        }
        if (lastFlowInfo.aprobador.rol !== client_1.Rol.COMPRAS) {
            throw new common_1.BadRequestException('Operación denegada. El último nivel de aprobación siempre debe ser de un usuario con rol COMPRAS.');
        }
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
};
exports.ApprovalFlowsService = ApprovalFlowsService;
exports.ApprovalFlowsService = ApprovalFlowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalFlowsService);
//# sourceMappingURL=approval-flows.service.js.map