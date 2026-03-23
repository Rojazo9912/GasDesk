import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Rol } from '@prisma/client';

export class CreatePerfilDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsEnum(Rol)
  rol: Rol;
}
