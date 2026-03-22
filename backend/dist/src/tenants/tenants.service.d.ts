import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createTenantDto: CreateTenantDto): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        logo: string | null;
        plan: string;
        activo: boolean;
        creadoEn: Date;
    }>;
    findAll(): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        logo: string | null;
        plan: string;
        activo: boolean;
        creadoEn: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        logo: string | null;
        plan: string;
        activo: boolean;
        creadoEn: Date;
    }>;
    update(id: string, updateTenantDto: UpdateTenantDto): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        logo: string | null;
        plan: string;
        activo: boolean;
        creadoEn: Date;
    }>;
}
