import { Rol } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: Rol;
  tenantId: string;
  userId?: string; // Some parts of the code might expect userId from the payload
}
