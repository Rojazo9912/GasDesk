import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { TenantGuard } from './guards/tenant.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'fallback-secret',
        signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Guards aplicados globalmente en este orden:
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 1. Verificar si hay token
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 2. Verificar rol (Legacy)
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard, // 3. Verificar permisos granulares
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard, // 4. Verificar aislamiento de tenant
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
