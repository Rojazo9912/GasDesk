import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  rfc: string;

  @IsString()
  @IsOptional()
  contactoNombre?: string;

  @IsEmail()
  @IsOptional()
  contactoEmail?: string;

  @IsString()
  @IsOptional()
  contactoTel?: string;

  @IsString()
  @IsOptional()
  condicionesPago?: string;
}
