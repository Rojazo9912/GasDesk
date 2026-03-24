import { IsNumber, IsPositive, IsOptional } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  montoAsignado?: number;
}
