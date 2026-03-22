import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createDto: CreateSupplierDto, tenantId: string): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        contactoNombre: string | null;
        contactoEmail: string | null;
        contactoTel: string | null;
        condicionesPago: string | null;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        contactoNombre: string | null;
        contactoEmail: string | null;
        contactoTel: string | null;
        condicionesPago: string | null;
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        contactoNombre: string | null;
        contactoEmail: string | null;
        contactoTel: string | null;
        condicionesPago: string | null;
    }>;
    update(id: string, updateDto: UpdateSupplierDto, tenantId: string): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        contactoNombre: string | null;
        contactoEmail: string | null;
        contactoTel: string | null;
        condicionesPago: string | null;
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        rfc: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        contactoNombre: string | null;
        contactoEmail: string | null;
        contactoTel: string | null;
        condicionesPago: string | null;
    }>;
}
