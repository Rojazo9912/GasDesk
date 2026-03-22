import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }>;
    findAll(user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }>;
}
