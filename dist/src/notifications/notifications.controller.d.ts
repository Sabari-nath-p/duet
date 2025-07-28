import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto, SendBulkNotificationDto, TestNotificationDto, CreateGeneralReminderDto } from './dto/notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto, req: any): Promise<{
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
    findAll(req: any, page?: string, limit?: string): Promise<{
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
    sendBulk(sendBulkDto: SendBulkNotificationDto, req: any): Promise<{
        message: string;
        notifications: {
            id: any;
            recipient: any;
        }[];
    }>;
    sendTest(testDto: TestNotificationDto, req: any): Promise<{
        message: string;
    }>;
    getStats(req: any): Promise<{
        totalNotifications: number;
        sentNotifications: number;
        deliveredNotifications: number;
        failedNotifications: number;
        pendingNotifications: number;
        emailNotifications: number;
        whatsappNotifications: number;
        successRate: number;
    }>;
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateNotificationDto: UpdateNotificationDto, req: any): Promise<{
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
    sendGeneralReminder(createReminderDto: CreateGeneralReminderDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
