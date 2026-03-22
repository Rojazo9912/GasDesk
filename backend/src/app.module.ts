import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { LocationsModule } from './locations/locations.module';
import { ProductsModule } from './products/products.module';
import { ApprovalFlowsModule } from './approval-flows/approval-flows.module';
import { PurchaseRequestsModule } from './purchase-requests/purchase-requests.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      exclude: ['/api*'],
    }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    LocationsModule,
    ProductsModule,
    ApprovalFlowsModule,
    PurchaseRequestsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    ...(process.env.REDIS_URL ? [BullModule.forRoot({ redis: process.env.REDIS_URL })] : [])
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
