import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateSupplierPriceDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @IsString()
  moneda?: string = 'MXN';

  @IsOptional()
  @IsString()
  notas?: string;
}
