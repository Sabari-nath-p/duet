import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto, CreatePaymentLinkDto, PaymentWebhookDto } from './dto/payment.dto';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createPaymentDto: CreatePaymentDto, currentUser: any): Promise<{
        userSubscription: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string | null;
            };
            template: {
                id: string;
                client: {
                    id: string;
                    name: string;
                };
                title: string;
            } | null;
        } & {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            body: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            recurringValue: number;
            recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
            notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
            paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
            userId: string;
            templateId: string | null;
            nextPaymentDate: Date;
        };
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        provider: import(".prisma/client").$Enums.PaymentProvider;
        status: import(".prisma/client").$Enums.PaymentStatus;
        userSubscriptionId: string;
        currency: string;
        dueDate: Date | null;
        externalPaymentId: string | null;
        gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
        paymentConfigId: string;
        providerPaymentId: string | null;
        paymentLink: string | null;
        expiresAt: Date | null;
        paidAt: Date | null;
        failureReason: string | null;
    }>;
    findAll(currentUser: any, page?: number, limit?: number, status?: string): Promise<{
        data: ({
            userSubscription: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                    phone: string | null;
                };
                template: {
                    id: string;
                    client: {
                        id: string;
                        name: string;
                    };
                    title: string;
                } | null;
            } & {
                id: string;
                isActive: boolean;
                clientId: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                body: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                recurringValue: number;
                recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
                notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
                paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
                userId: string;
                templateId: string | null;
                nextPaymentDate: Date;
            };
        } & {
            id: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            userId: string;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            status: import(".prisma/client").$Enums.PaymentStatus;
            userSubscriptionId: string;
            currency: string;
            dueDate: Date | null;
            externalPaymentId: string | null;
            gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
            paymentConfigId: string;
            providerPaymentId: string | null;
            paymentLink: string | null;
            expiresAt: Date | null;
            paidAt: Date | null;
            failureReason: string | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, currentUser: any): Promise<{
        userSubscription: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string | null;
            };
            template: {
                id: string;
                client: {
                    id: string;
                    name: string;
                };
                title: string;
            } | null;
        } & {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            body: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            recurringValue: number;
            recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
            notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
            paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
            userId: string;
            templateId: string | null;
            nextPaymentDate: Date;
        };
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        provider: import(".prisma/client").$Enums.PaymentProvider;
        status: import(".prisma/client").$Enums.PaymentStatus;
        userSubscriptionId: string;
        currency: string;
        dueDate: Date | null;
        externalPaymentId: string | null;
        gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
        paymentConfigId: string;
        providerPaymentId: string | null;
        paymentLink: string | null;
        expiresAt: Date | null;
        paidAt: Date | null;
        failureReason: string | null;
    }>;
    update(id: string, updatePaymentDto: UpdatePaymentDto, currentUser: any): Promise<{
        userSubscription: {
            user: {
                id: string;
                email: string;
                name: string;
                phone: string | null;
            };
            template: {
                id: string;
                client: {
                    id: string;
                    name: string;
                };
                title: string;
            } | null;
        } & {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            body: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            recurringValue: number;
            recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
            notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
            paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
            userId: string;
            templateId: string | null;
            nextPaymentDate: Date;
        };
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        provider: import(".prisma/client").$Enums.PaymentProvider;
        status: import(".prisma/client").$Enums.PaymentStatus;
        userSubscriptionId: string;
        currency: string;
        dueDate: Date | null;
        externalPaymentId: string | null;
        gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
        paymentConfigId: string;
        providerPaymentId: string | null;
        paymentLink: string | null;
        expiresAt: Date | null;
        paidAt: Date | null;
        failureReason: string | null;
    }>;
    remove(id: string, currentUser: any): Promise<{
        message: string;
    }>;
    createPaymentLink(createPaymentLinkDto: CreatePaymentLinkDto, currentUser: any): Promise<{
        payment: {
            userSubscription: {
                user: {
                    id: string;
                    email: string;
                    name: string;
                    phone: string | null;
                };
                template: {
                    id: string;
                    client: {
                        id: string;
                        name: string;
                    };
                    title: string;
                } | null;
            } & {
                id: string;
                isActive: boolean;
                clientId: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                body: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                recurringValue: number;
                recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
                notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
                paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
                userId: string;
                templateId: string | null;
                nextPaymentDate: Date;
            };
        } & {
            id: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            userId: string;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            status: import(".prisma/client").$Enums.PaymentStatus;
            userSubscriptionId: string;
            currency: string;
            dueDate: Date | null;
            externalPaymentId: string | null;
            gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
            paymentConfigId: string;
            providerPaymentId: string | null;
            paymentLink: string | null;
            expiresAt: Date | null;
            paidAt: Date | null;
            failureReason: string | null;
        };
        paymentUrl: string;
    }>;
    handleWebhook(webhookDto: PaymentWebhookDto): Promise<{
        status: string;
    }>;
    getPaymentStats(currentUser: any, startDate?: string, endDate?: string): Promise<{
        totalPayments: number;
        successfulPayments: number;
        pendingPayments: number;
        failedPayments: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        averagePaymentAmount: number | import("@prisma/client/runtime/library").Decimal;
        successRate: number;
    }>;
    private generateUniquePaymentLink;
    private generatePaymentGatewayLink;
    private verifyWebhookSignature;
    private handleRazorpayWebhook;
    private handleStripeWebhook;
    private updatePaymentStatus;
}
