import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Rol } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    private readonly resend;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto, currentUserId: string, currentUserRole: Rol, currentUserTenantId: string, requestedTenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }>;
    findAll(tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }[]>;
    findOne(id: string, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }>;
    remove(id: string, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        creadoEn: Date;
        email: string;
        tenantId: string;
        rol: import("@prisma/client").$Enums.Rol;
    }>;
}
