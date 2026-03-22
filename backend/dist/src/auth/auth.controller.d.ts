import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
