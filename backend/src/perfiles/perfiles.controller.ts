import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PerfilesService } from './perfiles.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('perfiles')
export class PerfilesController {
  constructor(private readonly perfilesService: PerfilesService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.perfilesService.findAll(user.tenantId);
  }

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  create(@Body() dto: CreatePerfilDto, @CurrentUser() user: any) {
    return this.perfilesService.create(user.tenantId, dto);
  }

  @Patch(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreatePerfilDto>, @CurrentUser() user: any) {
    return this.perfilesService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.perfilesService.remove(user.tenantId, id);
  }
}
