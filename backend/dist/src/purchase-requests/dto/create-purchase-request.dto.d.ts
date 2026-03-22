import { CreatePurchaseRequestItemDto } from './create-purchase-request-item.dto';
export declare class CreatePurchaseRequestDto {
    items: CreatePurchaseRequestItemDto[];
    locationId: string;
    notas?: string;
    adjuntoUrl?: string;
}
