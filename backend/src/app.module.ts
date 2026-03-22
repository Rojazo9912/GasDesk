import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { LocationsModule } from './locations/locations.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaModule, AuthModule, TenantsModule, UsersModule, LocationsModule, ProductsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
