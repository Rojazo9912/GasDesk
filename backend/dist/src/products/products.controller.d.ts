import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }>;
    findAll(user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }>;
    update(id: string, updateProductDto: UpdateProductDto, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        unidad: string;
        categoria: string;
        stockMinimo: number;
    }>;
}
