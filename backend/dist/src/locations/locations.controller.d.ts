import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    create(createLocationDto: CreateLocationDto, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }>;
    findAll(user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }>;
    update(id: string, updateLocationDto: UpdateLocationDto, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        nombre: string;
        activo: boolean;
        tenantId: string;
        tipo: string;
        direccion: string | null;
    }>;
}
