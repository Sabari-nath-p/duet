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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clients_service_1 = require("./clients.service");
const client_dto_1 = require("./dto/client.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let ClientsController = class ClientsController {
    clientsService;
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    create(createClientDto, req) {
        return this.clientsService.create(createClientDto, req.user.id);
    }
    findAll(req, page = 1, limit = 10) {
        return this.clientsService.findAll(req.user, page, limit);
    }
    findOne(id, req) {
        return this.clientsService.findOne(id, req.user);
    }
    update(id, updateClientDto, req) {
        return this.clientsService.update(id, updateClientDto, req.user);
    }
    remove(id, req) {
        return this.clientsService.remove(id, req.user);
    }
    getConfigurations(id, req) {
        return this.clientsService.getConfigurations(id, req.user);
    }
    updateWhatsappConfig(id, config, req) {
        return this.clientsService.updateWhatsappConfig(id, config, req.user);
    }
    updateEmailConfig(id, config, req) {
        return this.clientsService.updateEmailConfig(id, config, req.user);
    }
    updatePaymentConfig(id, config, req) {
        return this.clientsService.updatePaymentConfig(id, config, req.user);
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new client (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Client created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Client already exists' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [client_dto_1.CreateClientDto, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all clients with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Clients retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get client by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('SUPER_ADMIN', 'CLIENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Update client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, client_dto_1.UpdateClientDto, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete client (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Client not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/configurations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get client configurations (WhatsApp, Email, Payment)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurations retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "getConfigurations", null);
__decorate([
    (0, common_1.Patch)(':id/whatsapp-config'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('SUPER_ADMIN', 'CLIENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Update WhatsApp configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'WhatsApp config updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, client_dto_1.WhatsappConfigDto, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "updateWhatsappConfig", null);
__decorate([
    (0, common_1.Patch)(':id/email-config'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('SUPER_ADMIN', 'CLIENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Update email configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email config updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, client_dto_1.EmailConfigDto, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "updateEmailConfig", null);
__decorate([
    (0, common_1.Patch)(':id/payment-config'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('SUPER_ADMIN', 'CLIENT'),
    (0, swagger_1.ApiOperation)({ summary: 'Update payment configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment config updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, client_dto_1.PaymentConfigDto, Object]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "updatePaymentConfig", null);
exports.ClientsController = ClientsController = __decorate([
    (0, swagger_1.ApiTags)('Clients'),
    (0, common_1.Controller)('clients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map