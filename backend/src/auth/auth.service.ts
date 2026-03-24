import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Resend } from 'resend';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_123');
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.tenant.activo) {
      throw new UnauthorizedException('La empresa se encuentra inactiva');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        tenantId: user.tenantId,
        tenant: {
          id: user.tenant.id,
          nombre: user.tenant.nombre,
          logo: user.tenant.logo ?? null,
        },
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Respuesta silenciosa: no revelar si el email existe
    if (!user || !user.activo) return { message: 'Si el correo existe, recibirás un enlace en breve.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      try {
        await this.resend.emails.send({
          from: 'GasDesk <onboarding@resend.dev>',
          to: email,
          subject: 'Restablece tu contraseña — GasDesk',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
              <h2 style="color:#059669;">GasDesk</h2>
              <p>Hola <strong>${user.nombre}</strong>,</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Haz clic en el siguiente enlace (válido por 2 horas):</p>
              <a href="${resetLink}" style="display:inline-block;background:#059669;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
                Restablecer contraseña
              </a>
              <p style="color:#64748b;font-size:13px;">Si no solicitaste este cambio, ignora este correo.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('[Auth] Error enviando email de reset:', err);
      }
    }

    return { message: 'Si el correo existe, recibirás un enlace en breve.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('El enlace es inválido o ha expirado.');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hash, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}
