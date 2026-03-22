import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateApprovalFlowDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  aprobadorId: string;

  @IsNumber()
  @IsOptional()
  tiempoLimiteHrs?: number;

  @IsBoolean()
  @IsOptional()
  puedeRechazar?: boolean;
}
