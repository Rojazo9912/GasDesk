import { IsArray, IsUUID } from 'class-validator';

export class ReorderApprovalFlowsDto {
  @IsArray()
  @IsUUID(4, { each: true, message: 'Cada ID debe ser un UUID válido' })
  flowIds: string[];
}
