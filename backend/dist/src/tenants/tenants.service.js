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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTenantDto) {
        const existing = await this.prisma.tenant.findUnique({
            where: { rfc: createTenantDto.rfc },
        });
        if (existing) {
            throw new common_1.ConflictException('Ya existe una empresa con este RFC');
        }
        return this.prisma.tenant.create({
            data: createTenantDto,
        });
    }
    async findAll() {
        return this.prisma.tenant.findMany({
            orderBy: { creadoEn: 'desc' },
        });
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Empresa con ID ${id} no encontrada`);
        }
        return tenant;
    }
    async update(id, updateTenantDto) {
        await this.findOne(id);
        if (updateTenantDto.rfc) {
            const existing = await this.prisma.tenant.findUnique({
                where: { rfc: updateTenantDto.rfc },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Ya existe otra empresa con este RFC');
            }
        }
        return this.prisma.tenant.update({
            where: { id },
            data: updateTenantDto,
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map