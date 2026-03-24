import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLE_PERMISSIONS } from '../constants/permissions.constants';
import { Rol } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.rol) {
      throw new ForbiddenException('Acceso denegado: Usuario no autenticado ou sem rol');
    }

    // Super Admin tiene todos los permisos
    if (user.rol === Rol.SUPER_ADMIN) {
      return true;
    }

    const userPermissions = ROLE_PERMISSIONS[user.rol as Rol] || [];
    
    // El usuario debe tener TODOS los permisos requeridos (o al menos uno, según lógica)
    // Usaremos logic "Debe tener al menos uno" para mayor flexibilidad en decoradores múltiples
    const hasPermission = requiredPermissions.some((permission) => 
      userPermissions.includes(permission as any)
    );

    if (!hasPermission) {
      throw new ForbiddenException(`No tienes los permisos necesarios: ${requiredPermissions.join(', ')}`);
    }

    return true;
  }
}
