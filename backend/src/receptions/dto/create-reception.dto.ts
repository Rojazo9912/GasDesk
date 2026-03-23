import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

class ReceptionItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsPositive()
  cantidadRecibida: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class CreateReceptionDto {
  @IsString()
  @IsNotEmpty()
  ordenId: string;

  @IsOptional()
  @IsString()
  facturaId?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceptionItemDto)
  items: ReceptionItemDto[];
}
