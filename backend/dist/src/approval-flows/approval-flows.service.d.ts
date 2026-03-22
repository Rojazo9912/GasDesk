import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalFlowDto } from './dto/create-approval-flow.dto';
export declare class ApprovalFlowsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateApprovalFlowDto, tenantId: string): Promise<{
        aprobador: {
            nombre: string;
            email: string;
            rol: import("@prisma/client").$Enums.Rol;
        };
    } & {
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        aprobadorId: string;
        tiempoLimiteHrs: number | null;
        puedeRechazar: boolean;
        nivelOrden: number;
        alternoId: string | null;
        puedeReasignar: boolean;
        notificacion: import("@prisma/client").$Enums.TipoNotificacion;
        esFijo: boolean;
    }>;
    findAll(tenantId: string): Promise<({
        aprobador: {
            nombre: string;
            email: string;
            rol: import("@prisma/client").$Enums.Rol;
        };
    } & {
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        aprobadorId: string;
        tiempoLimiteHrs: number | null;
        puedeRechazar: boolean;
        nivelOrden: number;
        alternoId: string | null;
        puedeReasignar: boolean;
        notificacion: import("@prisma/client").$Enums.TipoNotificacion;
        esFijo: boolean;
    })[]>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        aprobadorId: string;
        tiempoLimiteHrs: number | null;
        puedeRechazar: boolean;
        nivelOrden: number;
        alternoId: string | null;
        puedeReasignar: boolean;
        notificacion: import("@prisma/client").$Enums.TipoNotificacion;
        esFijo: boolean;
    }>;
    reorderLevels(flowIds: string[], tenantId: string): Promise<({
        aprobador: {
            nombre: string;
            email: string;
            rol: import("@prisma/client").$Enums.Rol;
        };
    } & {
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        aprobadorId: string;
        tiempoLimiteHrs: number | null;
        puedeRechazar: boolean;
        nivelOrden: number;
        alternoId: string | null;
        puedeReasignar: boolean;
        notificacion: import("@prisma/client").$Enums.TipoNotificacion;
        esFijo: boolean;
    })[]>;
}
