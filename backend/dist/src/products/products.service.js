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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto, tenantId) {
        if (!tenantId) {
            throw new common_1.ForbiddenException('Se requiere una empresa para crear productos');
        }
        return this.prisma.product.create({
            data: {
                ...createProductDto,
                tenantId,
            },
        });
    }
    async findAll(tenantId) {
        const whereClause = { activo: true };
        if (tenantId) {
            whereClause.tenantId = tenantId;
        }
        return this.prisma.product.findMany({
            where: whereClause,
            orderBy: { nombre: 'asc' },
        });
    }
    async findOne(id, tenantId) {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        if (tenantId && product.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('No tienes permisos para ver este producto');
        }
        return product;
    }
    async update(id, updateProductDto, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.product.update({
            where: { id },
            data: { activo: false },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map