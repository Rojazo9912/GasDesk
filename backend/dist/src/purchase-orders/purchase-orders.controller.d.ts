import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
export declare class PurchaseOrdersController {
    private readonly purchaseOrdersService;
    constructor(purchaseOrdersService: PurchaseOrdersService);
    create(createDto: CreatePurchaseOrderDto, user: any): Promise<{
        supplier: {
            id: string;
            rfc: string;
            nombre: string;
            activo: boolean;
            tenantId: string;
            contactoNombre: string | null;
            contactoEmail: string | null;
            contactoTel: string | null;
            condicionesPago: string | null;
        };
        items: {
            id: string;
            productId: string;
            cantidadOrdenada: number;
            precioUnitario: number;
            importe: number;
            ordenId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        locationId: string;
        estatus: import("@prisma/client").$Enums.EstatusOC;
        actualizadoEn: Date;
        solicitudId: string;
        supplierId: string;
        subtotal: number;
        iva: number;
        total: number;
        fechaEntregaEsperada: Date | null;
        fechaEmision: Date;
        pdfUrl: string | null;
    }>;
    findAll(user: any): Promise<({
        location: {
            nombre: string;
        };
        supplier: {
            nombre: string;
        };
        solicitud: {
            id: string;
            notas: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        locationId: string;
        estatus: import("@prisma/client").$Enums.EstatusOC;
        actualizadoEn: Date;
        solicitudId: string;
        supplierId: string;
        subtotal: number;
        iva: number;
        total: number;
        fechaEntregaEsperada: Date | null;
        fechaEmision: Date;
        pdfUrl: string | null;
    })[]>;
    findOne(id: string, user: any): Promise<{
        location: {
            id: string;
            nombre: string;
            activo: boolean;
            tenantId: string;
            tipo: string;
            direccion: string | null;
        };
        supplier: {
            id: string;
            rfc: string;
            nombre: string;
            activo: boolean;
            tenantId: string;
            contactoNombre: string | null;
            contactoEmail: string | null;
            contactoTel: string | null;
            condicionesPago: string | null;
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
            productId: string;
            cantidadOrdenada: number;
            precioUnitario: number;
            importe: number;
            ordenId: string;
        })[];
        solicitud: {
            id: string;
            solicitante: {
                nombre: string;
            };
        };
    } & {
        id: string;
        tenantId: string;
        locationId: string;
        estatus: import("@prisma/client").$Enums.EstatusOC;
        actualizadoEn: Date;
        solicitudId: string;
        supplierId: string;
        subtotal: number;
        iva: number;
        total: number;
        fechaEntregaEsperada: Date | null;
        fechaEmision: Date;
        pdfUrl: string | null;
    }>;
    sendToSupplier(id: string, pdfUrl: string, user: any): Promise<{
        message: string;
        status: "ENVIADA";
    }>;
}
