import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            nombre: string;
            email: string;
            rol: import("@prisma/client").$Enums.Rol;
            tenantId: string;
            tenant: {
                id: string;
                nombre: string;
            };
        };
    }>;
}
