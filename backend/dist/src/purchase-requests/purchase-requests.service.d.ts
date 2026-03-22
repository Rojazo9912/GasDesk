import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
export declare class PurchaseRequestsService {
    private readonly prisma;
    private resend;
    constructor(prisma: PrismaService);
    private notifyUser;
    create(createDto: CreatePurchaseRequestDto, user: any): Promise<{
        historial: {
            id: string;
            aprobadorId: string;
            accion: string;
            comentario: string | null;
            fecha: Date;
            flowId: string;
            solicitudId: string;
        }[];
        items: {
            id: string;
            justificacion: string | null;
            cantidadSolicitada: number;
            productId: string;
            solicitudId: string;
        }[];
    } & {
        id: string;
        creadoEn: Date;
        tenantId: string;
        locationId: string;
        notas: string | null;
        adjuntoUrl: string | null;
        estatus: import("@prisma/client").$Enums.EstatusSC;
        nivelActual: number;
        actualizadoEn: Date;
        solicitanteId: string;
    }>;
    findAll(tenantId: string): Promise<({
        location: {
            nombre: string;
            tipo: string;
        };
        items: ({
            product: {
                id: string;
                nombre: string;
                activo: boolean;
                tenantId: string;
                unidad: string;
                categoria: string;
                stockMinimo: number;
            };
        } & {
            id: string;
            justificacion: string | null;
            cantidadSolicitada: number;
            productId: string;
            solicitudId: string;
        })[];
        solicitante: {
            nombre: string;
            email: string;
        };
    } & {
        id: string;
        creadoEn: Date;
        tenantId: string;
        locationId: string;
        notas: string | null;
        adjuntoUrl: string | null;
        estatus: import("@prisma/client").$Enums.EstatusSC;
        nivelActual: number;
        actualizadoEn: Date;
        solicitanteId: string;
    })[]>;
    findOne(id: string, tenantId: string): Promise<{
        location: {
            id: string;
            nombre: string;
            activo: boolean;
            tenantId: string;
            tipo: string;
            direccion: string | null;
        };
        historial: ({
            aprobador: {
                nombre: string;
                rol: import("@prisma/client").$Enums.Rol;
            };
            flow: {
                nombre: string;
                nivelOrden: number;
            };
        } & {
            id: string;
            aprobadorId: string;
            accion: string;
            comentario: string | null;
            fecha: Date;
            flowId: string;
            solicitudId: string;
        })[];
        items: ({
            product: {
                id: string;
                nombre: string;
                activo: boolean;
                tenantId: string;
                unidad: string;
                categoria: string;
                stockMinimo: number;
            };
        } & {
            id: string;
            justificacion: string | null;
            cantidadSolicitada: number;
            productId: string;
            solicitudId: string;
        })[];
        solicitante: {
            id: string;
            nombre: string;
            email: string;
            rol: import("@prisma/client").$Enums.Rol;
        };
    } & {
        id: string;
        creadoEn: Date;
        tenantId: string;
        locationId: string;
        notas: string | null;
        adjuntoUrl: string | null;
        estatus: import("@prisma/client").$Enums.EstatusSC;
        nivelActual: number;
        actualizadoEn: Date;
        solicitanteId: string;
    }>;
    approve(id: string, comentario: string | undefined, user: any): Promise<{
        id: string;
        creadoEn: Date;
        tenantId: string;
        locationId: string;
        notas: string | null;
        adjuntoUrl: string | null;
        estatus: import("@prisma/client").$Enums.EstatusSC;
        nivelActual: number;
        actualizadoEn: Date;
        solicitanteId: string;
    }>;
    reject(id: string, comentario: string, user: any): Promise<{
        id: string;
        creadoEn: Date;
        tenantId: string;
        locationId: string;
        notas: string | null;
        adjuntoUrl: string | null;
        estatus: import("@prisma/client").$Enums.EstatusSC;
        nivelActual: number;
        actualizadoEn: Date;
        solicitanteId: string;
    }>;
    markAsCompleted(id: string, user: any): Promise<{
        id: string;
        creadoEn: Date;
        tenantId: string;
        locationId: string;
        notas: string | null;
        adjuntoUrl: string | null;
        estatus: import("@prisma/client").$Enums.EstatusSC;
        nivelActual: number;
        actualizadoEn: Date;
        solicitanteId: string;
    }>;
}
