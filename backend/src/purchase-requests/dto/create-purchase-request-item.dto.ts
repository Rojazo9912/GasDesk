import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePurchaseRequestItemDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsString()
  @IsNotEmpty()
  justificacion: string;
}
