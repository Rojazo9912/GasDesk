import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  ordenId: string;

  @IsString()
  @IsNotEmpty()
  folioFiscalUuid: string;

  @IsString()
  @IsNotEmpty()
  rfcEmisor: string;

  @IsDateString()
  fechaEmision: string;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  iva: number;

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}
