import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto, SendBulkNotificationDto, TestNotificationDto } from './dto/notification.dto';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createNotificationDto: CreateNotificationDto, currentUser: any): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
        };
        userSubscription: {
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
        } | null;
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        userId: string;
        templateId: string | null;
        message: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userSubscriptionId: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        subject: string | null;
        templateVariables: import("@prisma/client/runtime/library").JsonValue | null;
        providerResponse: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
        recipient: string;
        paymentId: string | null;
        providerId: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    createGeneralReminder(createReminderDto: any, currentUser: any): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
        };
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        userId: string;
        templateId: string | null;
        message: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userSubscriptionId: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        subject: string | null;
        templateVariables: import("@prisma/client/runtime/library").JsonValue | null;
        providerResponse: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
        recipient: string;
        paymentId: string | null;
        providerId: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    findAll(currentUser: any, page?: number, limit?: number, status?: string, channel?: string): Promise<{
        data: ({
            userSubscription: ({
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
            }) | null;
        } & {
            id: string;
            clientId: string;
            createdAt: Date;
            userId: string;
            templateId: string | null;
            message: string;
            status: import(".prisma/client").$Enums.NotificationStatus;
            userSubscriptionId: string | null;
            channel: import(".prisma/client").$Enums.NotificationChannel;
            subject: string | null;
            templateVariables: import("@prisma/client/runtime/library").JsonValue | null;
            providerResponse: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
            recipient: string;
            paymentId: string | null;
            providerId: string | null;
            sentAt: Date | null;
            deliveredAt: Date | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, currentUser: any): Promise<{
        userSubscription: ({
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
        }) | null;
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        userId: string;
        templateId: string | null;
        message: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userSubscriptionId: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        subject: string | null;
        templateVariables: import("@prisma/client/runtime/library").JsonValue | null;
        providerResponse: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
        recipient: string;
        paymentId: string | null;
        providerId: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    update(id: string, updateNotificationDto: UpdateNotificationDto, currentUser: any): Promise<{
        userSubscription: ({
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
        }) | null;
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        userId: string;
        templateId: string | null;
        message: string;
        status: import(".prisma/client").$Enums.NotificationStatus;
        userSubscriptionId: string | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        subject: string | null;
        templateVariables: import("@prisma/client/runtime/library").JsonValue | null;
        providerResponse: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
        recipient: string;
        paymentId: string | null;
        providerId: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
    }>;
    remove(id: string, currentUser: any): Promise<{
        message: string;
    }>;
    sendBulk(sendBulkDto: SendBulkNotificationDto, currentUser: any): Promise<{
        message: string;
        notifications: {
            id: any;
            recipient: any;
        }[];
    }>;
    private sendBulkSubscriptionNotifications;
    private sendBulkGeneralReminders;
    sendTest(testDto: TestNotificationDto, currentUser: any): Promise<{
        message: string;
    }>;
    sendBulkNotification(sendBulkNotificationDto: SendBulkNotificationDto, currentUser: any): Promise<{
        message: string;
        notifications: any[];
    }>;
    testNotification(testNotificationDto: TestNotificationDto, currentUser: any): Promise<{
        message: string;
    }>;
    getNotificationStats(currentUser: any, startDate?: string, endDate?: string): Promise<{
        totalNotifications: number;
        sentNotifications: number;
        deliveredNotifications: number;
        failedNotifications: number;
        pendingNotifications: number;
        emailNotifications: number;
        whatsappNotifications: number;
        successRate: number;
    }>;
    private sendNotification;
    private sendEmail;
    private sendWhatsApp;
    private sendTestEmail;
    private sendTestWhatsApp;
    private processTemplateVariables;
}
