import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createLocationDto: CreateLocationDto, tenantId: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }>;
    findAll(tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }[]>;
    findOne(id: string, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }>;
    update(id: string, updateLocationDto: UpdateLocationDto, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }>;
    remove(id: string, tenantId?: string): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }>;
}
