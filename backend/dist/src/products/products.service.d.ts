import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: CreateProductDto, tenantId: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }>;
    findAll(tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }[]>;
    findOne(id: string, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }>;
    update(id: string, updateProductDto: UpdateProductDto, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }>;
    remove(id: string, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }>;
}
