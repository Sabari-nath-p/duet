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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TemplatesService = class TemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTemplateDto, currentUser) {
        if (currentUser.role === 'CLIENT_USER') {
            throw new common_1.ForbiddenException('Client users cannot create templates');
        }
        const clientId = currentUser.role === 'SUPER_ADMIN' ? null : currentUser.clientId;
        if (!clientId && currentUser.role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Client ID is required for non-super-admin users');
        }
        const template = await this.prisma.template.create({
            data: {
                title: createTemplateDto.title,
                body: createTemplateDto.body,
                amount: createTemplateDto.amount,
                recurringValue: createTemplateDto.recurringValue,
                recurringInterval: createTemplateDto.recurringInterval,
                notificationChannel: createTemplateDto.notificationChannel,
                paymentProvider: createTemplateDto.paymentProvider,
                isActive: createTemplateDto.isActive ?? true,
                clientId: clientId || currentUser.clientId,
                createdBy: currentUser.id,
                enablePaymentReminders: createTemplateDto.enablePaymentReminders ?? true,
                includePaymentLink: createTemplateDto.includePaymentLink ?? true,
                reminderDaysBefore: createTemplateDto.reminderDaysBefore ?? [7, 3, 1],
                enableOverdueReminders: createTemplateDto.enableOverdueReminders ?? true,
                overdueReminderDays: createTemplateDto.overdueReminderDays ?? [1, 3, 7],
            },
            include: {
                client: true,
                creator: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        return template;
    }
    async findAll(currentUser, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        let whereCondition = {};
        if (currentUser.role === 'CLIENT' || currentUser.role === 'CLIENT_USER') {
            whereCondition.clientId = currentUser.clientId;
        }
        const [templates, total] = await Promise.all([
            this.prisma.template.findMany({
                where: whereCondition,
                include: {
                    client: {
                        select: { id: true, name: true, email: true },
                    },
                    creator: {
                        select: { id: true, name: true, email: true },
                    },
                    _count: {
                        select: {
                            userSubscriptions: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.template.count({ where: whereCondition }),
        ]);
        return {
            data: templates,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, currentUser) {
        const template = await this.prisma.template.findUnique({
            where: { id },
            include: {
                client: {
                    select: { id: true, name: true, email: true },
                },
                creator: {
                    select: { id: true, name: true, email: true },
                },
                userSubscriptions: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN' && template.clientId !== currentUser.clientId) {
            throw new common_1.ForbiddenException('You can only access templates from your organization');
        }
        return template;
    }
    async update(id, updateTemplateDto, currentUser) {
        const template = await this.prisma.template.findUnique({
            where: { id },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN' && template.clientId !== currentUser.clientId) {
            throw new common_1.ForbiddenException('You can only update templates from your organization');
        }
        if (currentUser.role !== 'SUPER_ADMIN' && template.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('You can only update templates you created');
        }
        const updatedTemplate = await this.prisma.template.update({
            where: { id },
            data: updateTemplateDto,
            include: {
                client: {
                    select: { id: true, name: true, email: true },
                },
                creator: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        return updatedTemplate;
    }
    async remove(id, currentUser) {
        const template = await this.prisma.template.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        userSubscriptions: true,
                    },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN' && template.clientId !== currentUser.clientId) {
            throw new common_1.ForbiddenException('You can only delete templates from your organization');
        }
        if (currentUser.role !== 'SUPER_ADMIN' && template.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('You can only delete templates you created');
        }
        if (template._count.userSubscriptions > 0) {
            throw new common_1.ConflictException('Cannot delete template that is being used by user subscriptions');
        }
        await this.prisma.template.delete({
            where: { id },
        });
        return { message: 'Template deleted successfully' };
    }
    async getTemplateVariables() {
        return {
            variables: [
                { name: 'user_name', description: 'Name of the user' },
                { name: 'user_email', description: 'Email of the user' },
                { name: 'user_phone', description: 'Phone number of the user' },
                { name: 'amount', description: 'Payment amount' },
                { name: 'payment_link', description: 'Unique payment link' },
                { name: 'due_date', description: 'Payment due date' },
                { name: 'client_name', description: 'Name of the client/business' },
                { name: 'template_title', description: 'Title of the template' },
            ],
        };
    }
    async duplicateTemplate(id, currentUser) {
        const originalTemplate = await this.findOne(id, currentUser);
        const duplicatedTemplate = await this.prisma.template.create({
            data: {
                title: `${originalTemplate.title} (Copy)`,
                body: originalTemplate.body,
                amount: originalTemplate.amount,
                recurringValue: originalTemplate.recurringValue,
                recurringInterval: originalTemplate.recurringInterval,
                notificationChannel: originalTemplate.notificationChannel,
                paymentProvider: originalTemplate.paymentProvider,
                isActive: false,
                clientId: originalTemplate.clientId,
                createdBy: currentUser.id,
            },
            include: {
                client: {
                    select: { id: true, name: true, email: true },
                },
                creator: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        return duplicatedTemplate;
    }
    async getTemplateAnalytics(id, currentUser) {
        const template = await this.findOne(id, currentUser);
        const analytics = await this.prisma.$transaction([
            this.prisma.userSubscription.count({
                where: { templateId: id, isActive: true },
            }),
            this.prisma.payment.count({
                where: {
                    userSubscription: { templateId: id },
                },
            }),
            this.prisma.payment.count({
                where: {
                    userSubscription: { templateId: id },
                    status: 'COMPLETED',
                },
            }),
            this.prisma.payment.aggregate({
                where: {
                    userSubscription: { templateId: id },
                    status: 'COMPLETED',
                },
                _sum: {
                    amount: true,
                },
            }),
            this.prisma.payment.count({
                where: {
                    userSubscription: { templateId: id },
                    status: 'PENDING',
                },
            }),
        ]);
        const [totalSubscribers, totalPayments, successfulPayments, revenueSum, pendingPayments,] = analytics;
        const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
        return {
            template: {
                id: template.id,
                title: template.title,
            },
            metrics: {
                totalSubscribers,
                totalPayments,
                successfulPayments,
                pendingPayments,
                failedPayments: totalPayments - successfulPayments - pendingPayments,
                totalRevenue: revenueSum._sum.amount || 0,
                successRate: Math.round(successRate * 100) / 100,
            },
        };
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map