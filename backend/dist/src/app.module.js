"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const tenants_module_1 = require("./tenants/tenants.module");
const users_module_1 = require("./users/users.module");
const locations_module_1 = require("./locations/locations.module");
const products_module_1 = require("./products/products.module");
const approval_flows_module_1 = require("./approval-flows/approval-flows.module");
const purchase_requests_module_1 = require("./purchase-requests/purchase-requests.module");
const suppliers_module_1 = require("./suppliers/suppliers.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const bull_1 = require("@nestjs/bull");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            locations_module_1.LocationsModule,
            products_module_1.ProductsModule,
            approval_flows_module_1.ApprovalFlowsModule,
            purchase_requests_module_1.PurchaseRequestsModule,
            suppliers_module_1.SuppliersModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            ...(process.env.REDIS_URL ? [bull_1.BullModule.forRoot({ redis: process.env.REDIS_URL })] : [])
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map