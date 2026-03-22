import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando sembrado de la base de datos (Seed)...');

  // 1. Crear el Tenant inicial (La empresa principal o proveedora del SaaS)
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

  // 2. Crear el Usuario SUPER_ADMIN
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@gasdesk.mx' },
    update: {},
    create: {
      email: 'admin@gasdesk.mx',
      nombre: 'Administrador Principal',
      password: passwordHash,
      rol: Rol.SUPER_ADMIN,
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
