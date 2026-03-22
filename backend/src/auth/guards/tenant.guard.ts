import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // SUPER_ADMIN puede hacer requests a cualquier tenant (para gestión global)
    if (user.rol === Rol.SUPER_ADMIN) {
      return true;
    }

    if (!user.tenantId) {
      throw new ForbiddenException('El usuario no pertenece a ninguna empresa');
    }

    // Inyectamos el tenantId en el body/query/params si amerita o simplemente
    // dependemos del user.tenantId en los servicios para filtrar las consultas Prisma.
    // Opcionalmente, podemos validar si un 'tenantId' enviado en body coincide con el del user:
    const bodyTenantId = request.body?.tenantId;
    if (bodyTenantId && bodyTenantId !== user.tenantId) {
       throw new ForbiddenException('No tienes acceso a los recursos de esta empresa');
    }

    return true;
  }
}
