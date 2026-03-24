import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsPositive, ValidateNested, ArrayMinSize, IsInt } from 'class-validator';

export class QuotationItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsPositive()
  cantidadSolicitada: number;

  @IsOptional()
  @IsNumber()
  precioUnitario?: number;
}

export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty()
  solicitudId: string;

  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsOptional()
  @IsInt()
  validezDias?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  @ArrayMinSize(1)
  items: QuotationItemDto[];
}
