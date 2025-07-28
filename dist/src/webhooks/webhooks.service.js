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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processRazorpayWebhook(payload, signature) {
        this.logger.debug('Processing Razorpay webhook...');
        if (!this.verifyRazorpaySignature(payload, signature)) {
            throw new common_1.BadRequestException('Invalid Razorpay webhook signature');
        }
        const { event, payment } = payload;
        try {
            switch (event) {
                case 'payment.captured':
                    await this.handlePaymentCaptured(payment);
                    break;
                case 'payment.failed':
                    await this.handlePaymentFailed(payment);
                    break;
                case 'payment_link.paid':
                    await this.handlePaymentLinkPaid(payload.payment_link);
                    break;
                case 'payment_link.expired':
                    await this.handlePaymentLinkExpired(payload.payment_link);
                    break;
                default:
                    this.logger.warn(`Unhandled Razorpay event: ${event}`);
            }
            await this.logWebhookEvent('RAZORPAY', event, payload, 'SUCCESS');
            return { status: 'success', message: 'Webhook processed successfully' };
        }
        catch (error) {
            this.logger.error(`Error processing Razorpay webhook: ${error.message}`, error.stack);
            await this.logWebhookEvent('RAZORPAY', event, payload, 'FAILED', error.message);
            throw error;
        }
    }
    async handleStripeWebhook(payload, signature) {
        this.logger.debug('Processing Stripe webhook...');
        if (!this.verifyStripeSignature(payload, signature)) {
            throw new common_1.BadRequestException('Invalid Stripe webhook signature');
        }
        const { type, data } = payload;
        try {
            switch (type) {
                case 'checkout.session.completed':
                    await this.handleStripeCheckoutCompleted(data.object);
                    break;
                case 'checkout.session.expired':
                    await this.handleStripeCheckoutExpired(data.object);
                    break;
                case 'payment_intent.succeeded':
                    await this.handleStripePaymentSucceeded(data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handleStripePaymentFailed(data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleStripeInvoicePaymentSucceeded(data.object);
                    break;
                case 'customer.subscription.created':
                    await this.handleStripeSubscriptionCreated(data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleStripeSubscriptionDeleted(data.object);
                    break;
                default:
                    this.logger.warn(`Unhandled Stripe event: ${type}`);
            }
            await this.logWebhookEvent('STRIPE', type, payload, 'SUCCESS');
            return { status: 'success', message: 'Webhook processed successfully' };
        }
        catch (error) {
            this.logger.error(`Error processing Stripe webhook: ${error.message}`, error.stack);
            await this.logWebhookEvent('STRIPE', type, payload, 'FAILED', error.message);
            throw error;
        }
    }
    async handleWhatsAppWebhook(payload, signature) {
        this.logger.debug('Processing WhatsApp webhook...');
        if (signature && !this.verifyWhatsAppSignature(payload, signature)) {
            throw new common_1.BadRequestException('Invalid WhatsApp webhook signature');
        }
        try {
            const { entry } = payload;
            for (const entry_item of entry) {
                const { changes } = entry_item;
                for (const change of changes) {
                    if (change.field === 'messages') {
                        const { value } = change;
                        if (value.messages) {
                            for (const message of value.messages) {
                                await this.handleWhatsAppMessage(message, value.metadata);
                            }
                        }
                        if (value.statuses) {
                            for (const status of value.statuses) {
                                await this.handleWhatsAppStatus(status, value.metadata);
                            }
                        }
                    }
                }
            }
            await this.logWebhookEvent('WHATSAPP', 'message_status', payload, 'SUCCESS');
            return { status: 'success', message: 'WhatsApp webhook processed successfully' };
        }
        catch (error) {
            this.logger.error(`Error processing WhatsApp webhook: ${error.message}`, error.stack);
            await this.logWebhookEvent('WHATSAPP', 'message_status', payload, 'FAILED', error.message);
            throw error;
        }
    }
    async getWebhookLogs(currentUser, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        let whereCondition = {};
        if (currentUser.role === 'CLIENT') {
        }
        const [logs, total] = await Promise.all([
            this.prisma.webhookLog.findMany({
                where: whereCondition,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.webhookLog.count({ where: whereCondition }),
        ]);
        return {
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async handlePaymentCaptured(payment) {
        await this.updatePaymentStatus(payment.id, 'COMPLETED', payment);
        this.logger.log(`Payment captured: ${payment.id}`);
    }
    async handlePaymentFailed(payment) {
        await this.updatePaymentStatus(payment.id, 'FAILED', payment);
        this.logger.log(`Payment failed: ${payment.id}`);
    }
    async handlePaymentLinkPaid(paymentLink) {
        const payment = await this.prisma.payment.findFirst({
            where: { externalPaymentId: paymentLink.id },
        });
        if (payment) {
            await this.updatePaymentStatus(payment.id, 'COMPLETED', paymentLink);
            this.logger.log(`Payment link paid: ${paymentLink.id}`);
        }
    }
    async handlePaymentLinkExpired(paymentLink) {
        const payment = await this.prisma.payment.findFirst({
            where: { externalPaymentId: paymentLink.id },
        });
        if (payment) {
            await this.updatePaymentStatus(payment.id, 'FAILED', paymentLink);
            this.logger.log(`Payment link expired: ${paymentLink.id}`);
        }
    }
    async handleStripeCheckoutCompleted(session) {
        const payment = await this.prisma.payment.findFirst({
            where: { externalPaymentId: session.id },
        });
        if (payment) {
            await this.updatePaymentStatus(payment.id, 'COMPLETED', session);
            this.logger.log(`Stripe checkout completed: ${session.id}`);
        }
    }
    async handleStripeCheckoutExpired(session) {
        const payment = await this.prisma.payment.findFirst({
            where: { externalPaymentId: session.id },
        });
        if (payment) {
            await this.updatePaymentStatus(payment.id, 'FAILED', session);
            this.logger.log(`Stripe checkout expired: ${session.id}`);
        }
    }
    async handleStripePaymentSucceeded(paymentIntent) {
        const payment = await this.prisma.payment.findFirst({
            where: { externalPaymentId: paymentIntent.id },
        });
        if (payment) {
            await this.updatePaymentStatus(payment.id, 'COMPLETED', paymentIntent);
            this.logger.log(`Stripe payment succeeded: ${paymentIntent.id}`);
        }
    }
    async handleStripePaymentFailed(paymentIntent) {
        const payment = await this.prisma.payment.findFirst({
            where: { externalPaymentId: paymentIntent.id },
        });
        if (payment) {
            await this.updatePaymentStatus(payment.id, 'FAILED', paymentIntent);
            this.logger.log(`Stripe payment failed: ${paymentIntent.id}`);
        }
    }
    async handleStripeInvoicePaymentSucceeded(invoice) {
        this.logger.log(`Stripe invoice payment succeeded: ${invoice.id}`);
    }
    async handleStripeSubscriptionCreated(subscription) {
        this.logger.log(`Stripe subscription created: ${subscription.id}`);
    }
    async handleStripeSubscriptionDeleted(subscription) {
        this.logger.log(`Stripe subscription deleted: ${subscription.id}`);
    }
    async handleWhatsAppMessage(message, metadata) {
        this.logger.log(`WhatsApp message received from ${message.from}: ${message.type}`);
    }
    async handleWhatsAppStatus(status, metadata) {
        this.logger.log(`WhatsApp status update: ${status.id} - ${status.status}`);
        const notification = await this.prisma.notification.findFirst({
            where: {
                providerResponse: {
                    path: ['whatsapp_message_id'],
                    equals: status.id,
                },
            },
        });
        if (notification) {
            let notificationStatus = 'SENT';
            if (status.status === 'delivered') {
                notificationStatus = 'DELIVERED';
            }
            else if (status.status === 'failed') {
                notificationStatus = 'FAILED';
            }
            await this.prisma.notification.update({
                where: { id: notification.id },
                data: {
                    status: notificationStatus,
                    providerResponse: {
                        ...(typeof notification.providerResponse === 'object' && notification.providerResponse !== null ? notification.providerResponse : {}),
                        delivery_status: status,
                    },
                },
            });
        }
    }
    async updatePaymentStatus(paymentId, status, gatewayResponse) {
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: status,
                gatewayResponse,
                updatedAt: new Date(),
            },
        });
    }
    async logWebhookEvent(provider, eventType, payload, status, errorMessage) {
        await this.prisma.webhookLog.create({
            data: {
                webhookEndpointId: 'default',
                provider: provider,
                eventType,
                payload,
                signature: '',
                processed: status === 'SUCCESS',
                error: errorMessage,
            },
        });
    }
    verifyRazorpaySignature(payload, signature) {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            this.logger.warn('Razorpay webhook secret not configured');
            return true;
        }
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    verifyStripeSignature(payload, signature) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            this.logger.warn('Stripe webhook secret not configured');
            return true;
        }
        return true;
    }
    verifyWhatsAppSignature(payload, signature) {
        const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
        if (!webhookSecret) {
            this.logger.warn('WhatsApp webhook secret not configured');
            return true;
        }
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(payload))
            .digest('hex');
        return signature === `sha256=${expectedSignature}`;
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map