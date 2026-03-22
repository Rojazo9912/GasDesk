import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Rol } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;

  // En un inicio, la contraseña puede venir del form o generarse auto para la invitación
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsEnum(Rol, { message: 'Rol inválido' })
  rol: Rol;

  // tenantId se inyectará desde el JWT del usuario que lo crea,
  // a menos que sea el SUPER_ADMIN creando a alguien en un tenant específico.
}
