import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, CreatePaymentLinkDto, PaymentWebhookDto } from './dto/payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto, req: any): Promise<{
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
    findAll(req: any, page?: string, limit?: string, status?: string): Promise<{
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
    getPaymentStats(req: any, startDate?: string, endDate?: string): Promise<{
        totalPayments: number;
        successfulPayments: number;
        pendingPayments: number;
        failedPayments: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        averagePaymentAmount: number | import("@prisma/client/runtime/library").Decimal;
        successRate: number;
    }>;
    createPaymentLink(createPaymentLinkDto: CreatePaymentLinkDto, req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updatePaymentDto: UpdatePaymentDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
