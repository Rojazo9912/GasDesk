import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN) // Solo admin y super pueden crear usuarios
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    // el body.tenantId lo podemos sacar de DTO si SUPER_ADMIN crea tenant ajeno.
    // De momento lo pasamos de currentUser:
    return this.usersService.create(
      createUserDto,
      user.userId,
      user.rol,
      user.tenantId,
      (createUserDto as any).tenantId // solo funcionaría si SUPER_ADMIN lo manda
    );
  }

  @Get()
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  findAll(@CurrentUser() user: any) {
    // si es SUPER_ADMIN, trae todos de todos los tenants (si no manda param). 
    // Para simplificar, admins traen solo de su tenant.
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.usersService.findAll(tenantFiltrar);
  }

  @Get(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.usersService.findOne(id, tenantFiltrar);
  }

  @Patch(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.usersService.update(id, updateUserDto, tenantFiltrar);
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const tenantFiltrar = user.rol === Rol.SUPER_ADMIN ? null : user.tenantId;
    return this.usersService.remove(id, tenantFiltrar);
  }
}
