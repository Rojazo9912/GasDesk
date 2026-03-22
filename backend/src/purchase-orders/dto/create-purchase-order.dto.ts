import { IsString, IsNotEmpty, IsOptional, IsNumber, ValidateNested, ArrayMinSize, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  cantidadOrdenada: number;

  @IsNumber()
  precioUnitario: number;

  @IsNumber()
  importe: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  solicitudId: string;

  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  iva: number;

  @IsNumber()
  total: number;

  @IsOptional()
  @IsDateString()
  fechaEntregaEsperada?: string;

  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  @ArrayMinSize(1)
  items: CreatePurchaseOrderItemDto[];
}
