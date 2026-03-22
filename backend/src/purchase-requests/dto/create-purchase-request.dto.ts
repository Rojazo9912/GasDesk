import { IsArray, ValidateNested, ArrayMinSize, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePurchaseRequestItemDto } from './create-purchase-request-item.dto';

export class CreatePurchaseRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseRequestItemDto)
  @ArrayMinSize(1)
  items: CreatePurchaseRequestItemDto[];

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsString()
  @IsOptional()
  adjuntoUrl?: string; // Simulando URL externa
}
