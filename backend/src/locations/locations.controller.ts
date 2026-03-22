import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  create(@Body() createLocationDto: CreateLocationDto, @CurrentUser() user: any) {
    // Si un ADMIN crea una sucursal, toma su propio tenantId.
    // Si un SUPER_ADMIN la crea, lo ideal sería que mande el tenantId en el body.
    const targetTenantId = (user.rol === Rol.SUPER_ADMIN && (createLocationDto as any).tenantId)
      ? (createLocationDto as any).tenantId
      : user.tenantId;

    return this.locationsService.create(createLocationDto, targetTenantId);
  }

  @Get()
  // Puede ser público para GERENTE, ALMACENISTA, etc. si necesitan ver sucursales,
  // pero protegido por el Guard global de JWT para usuarios logueados.
  findAll(@CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.locationsService.findAll(tenantFiltrar);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.locationsService.findOne(id, tenantFiltrar);
  }

  @Patch(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.locationsService.update(id, updateLocationDto, tenantFiltrar);
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.locationsService.remove(id, tenantFiltrar);
  }
}
