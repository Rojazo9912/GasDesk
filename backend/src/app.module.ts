import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { InvoicesModule } from './invoices/invoices.module';
import { ReceptionsModule } from './receptions/receptions.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { DepartmentsModule } from './departments/departments.module';
import { DepartmentInventoryModule } from './department-inventory/department-inventory.module';
import { PerfilesModule } from './perfiles/perfiles.module';
import { QuotationsModule } from './quotations/quotations.module';
import { BudgetsModule } from './budgets/budgets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { StorageModule } from './common/storage/storage.module';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 900000,
      limit: 10,
    }]),
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
    InvoicesModule,
    ReceptionsModule,
    InventoryModule,
    ReportsModule,
    DepartmentsModule,
    DepartmentInventoryModule,
    PerfilesModule,
    QuotationsModule,
    BudgetsModule,
    NotificationsModule,
    AuditLogModule,
    StorageModule,
    ...(process.env.REDIS_URL ? [BullModule.forRoot({ redis: process.env.REDIS_URL })] : [])
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
