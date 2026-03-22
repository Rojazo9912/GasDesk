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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Inicializando sembrado de la base de datos (Seed)...');
    const tenant = await prisma.tenant.upsert({
        where: { rfc: 'SUPERADMIN99X' },
        update: {},
        create: {
            nombre: 'GasDesk Corp (Super Admin)',
            rfc: 'SUPERADMIN99X',
            plan: 'enterprise',
            activo: true,
        },
    });
    console.log('✅ Tenant inicial creado:', tenant.nombre);
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@gasdesk.mx' },
        update: {},
        create: {
            email: 'admin@gasdesk.mx',
            nombre: 'Administrador Principal',
            password: passwordHash,
            rol: client_1.Rol.SUPER_ADMIN,
            tenantId: tenant.id,
            activo: true,
        },
    });
    console.log('✅ Usuario SUPER_ADMIN creado:', superAdmin.email);
    console.log('🔑 Email: admin@gasdesk.mx');
    console.log('🔑 Password: Admin123!');
}
main()
    .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    console.log('🏁 Seed terminado.');
});
//# sourceMappingURL=seed.js.map