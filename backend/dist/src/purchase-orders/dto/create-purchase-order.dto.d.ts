export declare class CreatePurchaseOrderItemDto {
    productId: string;
    cantidadOrdenada: number;
    precioUnitario: number;
    importe: number;
}
export declare class CreatePurchaseOrderDto {
    solicitudId: string;
    supplierId: string;
    locationId: string;
    subtotal: number;
    iva: number;
    total: number;
    fechaEntregaEsperada?: string;
    items: CreatePurchaseOrderItemDto[];
}
