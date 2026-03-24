import { IsString, IsNotEmpty, IsInt, IsNumber, IsPositive, Min, Max } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsInt()
  @Min(2020)
  @Max(2100)
  anio: number;

  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsNumber()
  @IsPositive()
  montoAsignado: number;
}
