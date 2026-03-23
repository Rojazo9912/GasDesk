import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Rol } from '@prisma/client';

@Injectable()
export class UsersService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUserId: string, currentUserRole: Rol, currentUserTenantId: string, requestedTenantId?: string) {
    const emailExist = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (emailExist) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Determinar a qué tenant pertenece el nuevo usuario
    let targetTenantId = currentUserTenantId;
    
    if (currentUserRole === Rol.SUPER_ADMIN && requestedTenantId) {
      targetTenantId = requestedTenantId;
    }

    if (!targetTenantId) {
       throw new ForbiddenException('Se requiere especificar la empresa (tenantId) para este usuario');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        tenantId: targetTenantId,
      },
    });

    // Excluir la contraseña al retornar
    const { password, ...result } = user;
    return result;
  }

  async findAll(tenantId?: string) {
    const whereClause = tenantId ? { tenantId } : {};
    const users = await this.prisma.user.findMany({
      where: whereClause,
      orderBy: { creadoEn: 'desc' },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        creadoEn: true,
        tenantId: true,
      }
    });

    return users;
  }

  async findOne(id: string, tenantId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        creadoEn: true,
        tenantId: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    if (tenantId && user.tenantId !== tenantId) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId?: string) {
    // Verificar existencia y acceso
    await this.findOne(id, tenantId);

    if (updateUserDto.email) {
      const emailExist = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExist && emailExist.id !== id) {
        throw new ConflictException('El correo electrónico ya está en uso por otro usuario');
      }
    }

    const dataToUpdate: any = { ...updateUserDto };
    
    // Si se envía password, re-hashear
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  async remove(id: string, tenantId?: string) {
    // En lugar de borrar físicamente, hacemos soft delete (activo = false)
    await this.findOne(id, tenantId);
    
    const disabledUser = await this.prisma.user.update({
      where: { id },
      data: { activo: false },
    });

    const { password, ...result } = disabledUser;
    return result;
  }
}
