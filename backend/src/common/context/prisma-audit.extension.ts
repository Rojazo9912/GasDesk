import { Prisma } from '@prisma/client';
import { userContextStorage } from './user-context';

export const auditExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          const result = await query(args);
          if (result && (result as any).id) {
            await logAction(client, model, 'CREATE', (result as any).id, result, (result as any).tenantId);
          }
          return result;
        },
        async update({ model, args, query }) {
          const result = await query(args);
          if (result && (result as any).id) {
            await logAction(client, model, 'UPDATE', (result as any).id, args.data, (result as any).tenantId);
          }
          return result;
        },
        async delete({ model, args, query }) {
          const result = await query(args);
          if (result && (result as any).id) {
            await logAction(client, model, 'DELETE', (result as any).id, null, (result as any).tenantId);
          }
          return result;
        },
      },
    },
  });
});

async function logAction(client: any, model: string, accion: string, entidadId: string, data: any, tenantId?: string) {
  const context = userContextStorage.getStore();
  
  // No auditar la propia tabla de logs para evitar bucles infinitos
  if (model === 'AuditLog' || model === 'Notification' || model === 'RefreshToken') return;

  const tId = tenantId || context?.tenantId;
  if (!tId) return;

  try {
    await client.auditLog.create({
      data: {
        tenantId: tId,
        userId: context?.userId || null,
        entidad: model,
        entidadId: entidadId.toString(),
        accion,
        camposModificados: data ? JSON.parse(JSON.stringify(data)) : null,
      },
    });
  } catch (error) {
    console.error(`[AuditExtension] Error logging ${accion} on ${model}:`, error);
  }
}
