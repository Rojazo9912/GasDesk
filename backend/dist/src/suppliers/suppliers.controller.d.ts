import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    create(createDto: CreateSupplierDto, user: any): Promise<{
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
    findAll(user: any): Promise<{
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
    findOne(id: string, user: any): Promise<{
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
    update(id: string, updateDto: UpdateSupplierDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
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
