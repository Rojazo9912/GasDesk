import { ApprovalFlowsService } from './approval-flows.service';
import { CreateApprovalFlowDto } from './dto/create-approval-flow.dto';
export declare class ApprovalFlowsController {
    private readonly approvalFlowsService;
    constructor(approvalFlowsService: ApprovalFlowsService);
    create(createDto: CreateApprovalFlowDto, user: any): Promise<{
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
    findAll(user: any): Promise<({
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
    reorder(flowIds: string[], user: any): Promise<({
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
    remove(id: string, user: any): Promise<{
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
}
