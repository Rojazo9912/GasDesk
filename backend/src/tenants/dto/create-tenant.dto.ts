import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TenantAdminDto {
  @IsNotEmpty({ message: 'El nombre del administrador es requerido' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El email del administrador es requerido' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}

export class CreateTenantDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El RFC es requerido' })
  @IsString()
  rfc: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsNotEmpty({ message: 'Los datos del administrador son requeridos' })
  @ValidateNested()
  @Type(() => TenantAdminDto)
  adminUser: TenantAdminDto;
}
