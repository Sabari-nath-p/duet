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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const payment_dto_1 = require("./dto/payment.dto");
const crypto = require("crypto");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPaymentDto, currentUser) {
        const userSubscription = await this.prisma.userSubscription.findUnique({
            where: { id: createPaymentDto.userSubscriptionId },
            include: {
                user: true,
                template: {
                    include: {
                        client: {
                            include: { paymentConfigs: true }
                        }
                    },
                },
            },
        });
        if (!userSubscription) {
            throw new common_1.NotFoundException('User subscription not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && userSubscription.template?.clientId !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only create payments for your client users');
            }
            if (currentUser.role === 'CLIENT_USER' && userSubscription.userId !== currentUser.id) {
                throw new common_1.ForbiddenException('You can only create payments for yourself');
            }
        }
        const payment = await this.prisma.payment.create({
            data: {
                userSubscriptionId: createPaymentDto.userSubscriptionId,
                userId: userSubscription.userId,
                clientId: userSubscription.template?.clientId || userSubscription.clientId,
                paymentConfigId: userSubscription.template?.client?.paymentConfigs?.[0]?.id || '',
                amount: createPaymentDto.amount,
                currency: createPaymentDto.currency || 'INR',
                provider: createPaymentDto.provider,
                dueDate: new Date(createPaymentDto.dueDate),
                description: createPaymentDto.description,
                status: 'PENDING',
                paymentLink: this.generateUniquePaymentLink(),
            },
            include: {
                userSubscription: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, phone: true },
                        },
                        template: {
                            select: { id: true, title: true, client: { select: { id: true, name: true } } },
                        },
                    },
                },
            },
        });
        return payment;
    }
    async findAll(currentUser, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        let whereCondition = {};
        if (currentUser.role === 'CLIENT') {
            whereCondition.userSubscription = {
                template: { clientId: currentUser.clientId },
            };
        }
        else if (currentUser.role === 'CLIENT_USER') {
            whereCondition.userSubscription = {
                userId: currentUser.id,
            };
        }
        if (status) {
            whereCondition.status = status;
        }
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: whereCondition,
                include: {
                    userSubscription: {
                        include: {
                            user: {
                                select: { id: true, name: true, email: true, phone: true },
                            },
                            template: {
                                select: { id: true, title: true, client: { select: { id: true, name: true } } },
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.payment.count({ where: whereCondition }),
        ]);
        return {
            data: payments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, currentUser) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                userSubscription: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, phone: true },
                        },
                        template: {
                            select: { id: true, title: true, client: { select: { id: true, name: true } } },
                        },
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && payment.userSubscription.template?.client?.id !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only access payments from your organization');
            }
            if (currentUser.role === 'CLIENT_USER' && payment.userSubscription.userId !== currentUser.id) {
                throw new common_1.ForbiddenException('You can only access your own payments');
            }
        }
        return payment;
    }
    async update(id, updatePaymentDto, currentUser) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                userSubscription: {
                    include: {
                        template: { include: { client: true } },
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && payment.userSubscription.template?.clientId !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only update payments from your organization');
            }
            if (currentUser.role === 'CLIENT_USER') {
                throw new common_1.ForbiddenException('Client users cannot update payments');
            }
        }
        const { userSubscriptionId, ...updateData } = updatePaymentDto;
        const updatedPayment = await this.prisma.payment.update({
            where: { id },
            data: updateData,
            include: {
                userSubscription: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, phone: true },
                        },
                        template: {
                            select: { id: true, title: true, client: { select: { id: true, name: true } } },
                        },
                    },
                },
            },
        });
        return updatedPayment;
    }
    async remove(id, currentUser) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
                userSubscription: {
                    include: {
                        template: { include: { client: true } },
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && payment.userSubscription.template?.clientId !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only delete payments from your organization');
            }
            if (currentUser.role === 'CLIENT_USER') {
                throw new common_1.ForbiddenException('Client users cannot delete payments');
            }
        }
        if (payment.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending payments can be deleted');
        }
        await this.prisma.payment.delete({
            where: { id },
        });
        return { message: 'Payment deleted successfully' };
    }
    async createPaymentLink(createPaymentLinkDto, currentUser) {
        const payment = await this.create({
            userSubscriptionId: createPaymentLinkDto.userSubscriptionId,
            amount: createPaymentLinkDto.amount,
            dueDate: createPaymentLinkDto.dueDate,
            description: createPaymentLinkDto.description,
            provider: payment_dto_1.PaymentProvider.RAZORPAY,
        }, currentUser);
        const paymentLink = await this.generatePaymentGatewayLink(payment, createPaymentLinkDto);
        const updatedPayment = await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                externalPaymentId: paymentLink.id,
                gatewayResponse: paymentLink,
            },
            include: {
                userSubscription: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, phone: true },
                        },
                        template: {
                            select: { id: true, title: true, client: { select: { id: true, name: true } } },
                        },
                    },
                },
            },
        });
        return {
            payment: updatedPayment,
            paymentUrl: paymentLink.short_url,
        };
    }
    async handleWebhook(webhookDto) {
        const isValid = await this.verifyWebhookSignature(webhookDto);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        if (webhookDto.provider === 'RAZORPAY') {
            return this.handleRazorpayWebhook(webhookDto);
        }
        else if (webhookDto.provider === 'STRIPE') {
            return this.handleStripeWebhook(webhookDto);
        }
        throw new common_1.BadRequestException('Unsupported payment provider');
    }
    async getPaymentStats(currentUser, startDate, endDate) {
        let whereCondition = {};
        if (currentUser.role === 'CLIENT') {
            whereCondition.userSubscription = {
                template: { clientId: currentUser.clientId },
            };
        }
        else if (currentUser.role === 'CLIENT_USER') {
            whereCondition.userSubscription = {
                userId: currentUser.id,
            };
        }
        if (startDate && endDate) {
            whereCondition.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        const stats = await this.prisma.$transaction([
            this.prisma.payment.count({ where: whereCondition }),
            this.prisma.payment.count({ where: { ...whereCondition, status: 'COMPLETED' } }),
            this.prisma.payment.count({ where: { ...whereCondition, status: 'PENDING' } }),
            this.prisma.payment.count({ where: { ...whereCondition, status: 'FAILED' } }),
            this.prisma.payment.aggregate({
                where: { ...whereCondition, status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: whereCondition,
                _avg: { amount: true },
            }),
        ]);
        const [totalPayments, successfulPayments, pendingPayments, failedPayments, revenue, avgAmount] = stats;
        const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
        return {
            totalPayments,
            successfulPayments,
            pendingPayments,
            failedPayments,
            totalRevenue: revenue._sum.amount || 0,
            averagePaymentAmount: avgAmount._avg.amount || 0,
            successRate: Math.round(successRate * 100) / 100,
        };
    }
    generateUniquePaymentLink() {
        return `pay_${crypto.randomBytes(16).toString('hex')}`;
    }
    async generatePaymentGatewayLink(payment, linkDto) {
        return {
            id: `link_${crypto.randomBytes(16).toString('hex')}`,
            short_url: `https://rzp.io/l/${crypto.randomBytes(8).toString('hex')}`,
            amount: payment.amount * 100,
            currency: payment.currency,
            description: payment.description,
        };
    }
    async verifyWebhookSignature(webhookDto) {
        return true;
    }
    async handleRazorpayWebhook(webhookDto) {
        const { event, payload } = webhookDto;
        if (event === 'payment.captured') {
            await this.updatePaymentStatus(payload.payment_link.id, 'COMPLETED', payload);
        }
        else if (event === 'payment.failed') {
            await this.updatePaymentStatus(payload.payment_link.id, 'FAILED', payload);
        }
        return { status: 'processed' };
    }
    async handleStripeWebhook(webhookDto) {
        const { event, payload } = webhookDto;
        if (event === 'checkout.session.completed') {
            await this.updatePaymentStatus(payload.id, 'COMPLETED', payload);
        }
        else if (event === 'checkout.session.expired') {
            await this.updatePaymentStatus(payload.id, 'FAILED', payload);
        }
        return { status: 'processed' };
    }
    async updatePaymentStatus(externalPaymentId, status, gatewayResponse) {
        await this.prisma.payment.updateMany({
            where: { externalPaymentId },
            data: {
                status: status,
                gatewayResponse,
                updatedAt: new Date(),
            },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map