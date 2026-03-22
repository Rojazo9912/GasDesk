import { Rol } from '@prisma/client';
export declare class CreateUserDto {
    nombre: string;
    email: string;
    password: string;
    rol: Rol;
}
