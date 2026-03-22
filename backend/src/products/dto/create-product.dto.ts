import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  unidad: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockMinimo?: number;
}
