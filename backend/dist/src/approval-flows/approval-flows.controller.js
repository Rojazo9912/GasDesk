"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalFlowsController = void 0;
const common_1 = require("@nestjs/common");
const approval_flows_service_1 = require("./approval-flows.service");
const create_approval_flow_dto_1 = require("./dto/create-approval-flow.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ApprovalFlowsController = class ApprovalFlowsController {
    approvalFlowsService;
    constructor(approvalFlowsService) {
        this.approvalFlowsService = approvalFlowsService;
    }
    create(createDto, user) {
        return this.approvalFlowsService.create(createDto, user.tenantId);
    }
    findAll(user) {
        return this.approvalFlowsService.findAll(user.tenantId);
    }
    reorder(flowIds, user) {
        return this.approvalFlowsService.reorderLevels(flowIds, user.tenantId);
    }
    remove(id, user) {
        return this.approvalFlowsService.remove(id, user.tenantId);
    }
};
exports.ApprovalFlowsController = ApprovalFlowsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_approval_flow_dto_1.CreateApprovalFlowDto, Object]),
    __metadata("design:returntype", void 0)
], ApprovalFlowsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApprovalFlowsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    __param(0, (0, common_1.Body)('flowIds')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", void 0)
], ApprovalFlowsController.prototype, "reorder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApprovalFlowsController.prototype, "remove", null);
exports.ApprovalFlowsController = ApprovalFlowsController = __decorate([
    (0, common_1.Controller)('approval-flows'),
    (0, roles_decorator_1.Roles)(client_1.Rol.SUPER_ADMIN, client_1.Rol.ADMIN),
    __metadata("design:paramtypes", [approval_flows_service_1.ApprovalFlowsService])
], ApprovalFlowsController);
//# sourceMappingURL=approval-flows.controller.js.map