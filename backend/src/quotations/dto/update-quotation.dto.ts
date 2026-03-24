import { Type } from 'class-transformer';
import { IsOptional, IsString, IsArray, ValidateNested, IsNumber, IsPositive } from 'class-validator';

export class UpdateQuotationItemDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  precioUnitario?: number;

  @IsOptional()
  @IsNumber()
  importe?: number;
}

export class UpdateQuotationDto {
  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuotationItemDto)
  items?: UpdateQuotationItemDto[];
}
