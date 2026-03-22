"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const resend_1 = require("resend");
let UsersService = class UsersService {
    prisma;
    resend = new resend_1.Resend(process.env.RESEND_API_KEY);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto, currentUserId, currentUserRole, currentUserTenantId, requestedTenantId) {
        const emailExist = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });
        if (emailExist) {
            throw new common_1.ConflictException('El correo electrónico ya está registrado');
        }
        let targetTenantId = currentUserTenantId;
        if (currentUserRole === client_1.Rol.SUPER_ADMIN && requestedTenantId) {
            targetTenantId = requestedTenantId;
        }
        if (!targetTenantId) {
            throw new common_1.ForbiddenException('Se requiere especificar la empresa (tenantId) para este usuario');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
                tenantId: targetTenantId,
            },
        });
        const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
        try {
            await this.resend.emails.send({
                from: `GasDesk <${fromEmail}>`,
                to: user.email,
                subject: 'Invitación a GasDesk',
                html: `
          <h2>¡Bienvenido a GasDesk!</h2>
          <p>Hola ${user.nombre}, has sido inviado a unirte a la plataforma.</p>
          <p>Tu contraseña temporal es: <strong>${createUserDto.password}</strong></p>
          <p>Por favor, usa esta contraseña para iniciar sesión y asegúrate de cambiarla posteriormente.</p>
        `,
            });
        }
        catch (e) {
            console.error('Error al enviar correo de invitación:', e);
        }
        const { password, ...result } = user;
        return result;
    }
    async findAll(tenantId) {
        const whereClause = tenantId ? { tenantId } : {};
        const users = await this.prisma.user.findMany({
            where: whereClause,
            orderBy: { creadoEn: 'desc' },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
                creadoEn: true,
                tenantId: true,
            }
        });
        return users;
    }
    async findOne(id, tenantId) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
                creadoEn: true,
                tenantId: true,
            }
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        if (tenantId && user.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('No tienes permiso para ver este usuario');
        }
        return user;
    }
    async update(id, updateUserDto, tenantId) {
        await this.findOne(id, tenantId);
        if (updateUserDto.email) {
            const emailExist = await this.prisma.user.findUnique({
                where: { email: updateUserDto.email },
            });
            if (emailExist && emailExist.id !== id) {
                throw new common_1.ConflictException('El correo electrónico ya está en uso por otro usuario');
            }
        }
        const dataToUpdate = { ...updateUserDto };
        if (updateUserDto.password) {
            dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
        const { password, ...result } = updatedUser;
        return result;
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        const disabledUser = await this.prisma.user.update({
            where: { id },
            data: { activo: false },
        });
        const { password, ...result } = disabledUser;
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map