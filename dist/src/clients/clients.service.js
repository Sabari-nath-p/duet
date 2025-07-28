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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createClientDto, currentUserId) {
        const existingClient = await this.prisma.client.findUnique({
            where: { email: createClientDto.email },
        });
        if (existingClient) {
            throw new common_1.ConflictException('Client with this email already exists');
        }
        const client = await this.prisma.client.create({
            data: {
                name: createClientDto.name,
                email: createClientDto.email,
                phone: createClientDto.phone,
                description: createClientDto.description,
                isActive: createClientDto.isActive ?? true,
                createdById: currentUserId,
            },
            include: {
                createdBy: true,
                whatsappConfig: true,
                emailConfig: true,
                paymentConfigs: true,
            },
        });
        return client;
    }
    async findAll(currentUser, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        let whereCondition = {};
        if (currentUser.role !== 'SUPER_ADMIN') {
            whereCondition.id = currentUser.clientId;
        }
        const [clients, total] = await Promise.all([
            this.prisma.client.findMany({
                where: whereCondition,
                include: {
                    createdBy: {
                        select: { id: true, name: true, email: true },
                    },
                    _count: {
                        select: {
                            users: true,
                            templates: true,
                            payments: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.client.count({ where: whereCondition }),
        ]);
        return {
            data: clients,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, currentUser) {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== id) {
            throw new common_1.ForbiddenException('You can only access your own client information');
        }
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                whatsappConfig: true,
                emailConfig: true,
                paymentConfigs: true,
                customFieldDefs: true,
                _count: {
                    select: {
                        users: true,
                        templates: true,
                        payments: true,
                        userSubscriptions: true,
                    },
                },
            },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        return client;
    }
    async update(id, updateClientDto, currentUser) {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== id) {
            throw new common_1.ForbiddenException('You can only update your own client information');
        }
        const existingClient = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!existingClient) {
            throw new common_1.NotFoundException('Client not found');
        }
        const updatedClient = await this.prisma.client.update({
            where: { id },
            data: updateClientDto,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                whatsappConfig: true,
                emailConfig: true,
                paymentConfigs: true,
            },
        });
        return updatedClient;
    }
    async remove(id, currentUser) {
        if (currentUser.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Only super admins can delete clients');
        }
        const client = await this.prisma.client.findUnique({
            where: { id },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        await this.prisma.client.delete({
            where: { id },
        });
        return { message: 'Client deleted successfully' };
    }
    async updateWhatsappConfig(clientId, config, currentUser) {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only update your own WhatsApp configuration');
        }
        const whatsappConfig = await this.prisma.whatsappConfig.upsert({
            where: { clientId },
            update: {
                businessApiKey: config.businessApiKey,
                phoneNumberId: config.phoneNumberId,
                accessToken: config.accessToken,
                webhookSecret: config.webhookSecret,
            },
            create: {
                clientId,
                businessApiKey: config.businessApiKey,
                phoneNumberId: config.phoneNumberId,
                accessToken: config.accessToken,
                webhookSecret: config.webhookSecret,
            },
        });
        return whatsappConfig;
    }
    async updateEmailConfig(clientId, config, currentUser) {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only update your own email configuration');
        }
        const emailConfig = await this.prisma.emailConfig.upsert({
            where: { clientId },
            update: {
                smtpHost: config.smtpHost,
                smtpPort: parseInt(config.smtpPort),
                smtpUser: config.smtpUser,
                smtpPassword: config.smtpPassword,
                fromEmail: config.fromEmail,
                fromName: config.fromName,
            },
            create: {
                clientId,
                smtpHost: config.smtpHost,
                smtpPort: parseInt(config.smtpPort),
                smtpUser: config.smtpUser,
                smtpPassword: config.smtpPassword,
                fromEmail: config.fromEmail,
                fromName: config.fromName,
            },
        });
        return emailConfig;
    }
    async updatePaymentConfig(clientId, config, currentUser) {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only update your own payment configuration');
        }
        const paymentConfig = await this.prisma.paymentConfig.upsert({
            where: {
                clientId_provider: {
                    clientId,
                    provider: config.provider,
                },
            },
            update: {
                publicKey: config.publicKey,
                secretKey: config.secretKey,
                webhookSecret: config.webhookSecret,
            },
            create: {
                clientId,
                provider: config.provider,
                publicKey: config.publicKey,
                secretKey: config.secretKey,
                webhookSecret: config.webhookSecret,
            },
        });
        return paymentConfig;
    }
    async getConfigurations(clientId, currentUser) {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== clientId) {
            throw new common_1.ForbiddenException('You can only access your own configurations');
        }
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
            include: {
                whatsappConfig: true,
                emailConfig: true,
                paymentConfigs: true,
            },
        });
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        return {
            whatsappConfig: client.whatsappConfig,
            emailConfig: client.emailConfig,
            paymentConfigs: client.paymentConfigs,
        };
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map