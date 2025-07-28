import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
export declare class TemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTemplateDto: CreateTemplateDto, currentUser: any): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdById: string;
        };
        creator: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        title: string;
        body: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        recurringValue: number;
        recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
        notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
        paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
        enablePaymentReminders: boolean;
        includePaymentLink: boolean;
        reminderDaysBefore: number[];
        enableOverdueReminders: boolean;
        overdueReminderDays: number[];
    }>;
    findAll(currentUser: any, page?: number, limit?: number): Promise<{
        data: ({
            client: {
                id: string;
                email: string;
                name: string;
            };
            _count: {
                userSubscriptions: number;
            };
            creator: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string;
            title: string;
            body: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            recurringValue: number;
            recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
            notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
            paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
            enablePaymentReminders: boolean;
            includePaymentLink: boolean;
            reminderDaysBefore: number[];
            enableOverdueReminders: boolean;
            overdueReminderDays: number[];
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, currentUser: any): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
        };
        userSubscriptions: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
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
        })[];
        creator: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        title: string;
        body: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        recurringValue: number;
        recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
        notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
        paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
        enablePaymentReminders: boolean;
        includePaymentLink: boolean;
        reminderDaysBefore: number[];
        enableOverdueReminders: boolean;
        overdueReminderDays: number[];
    }>;
    update(id: string, updateTemplateDto: UpdateTemplateDto, currentUser: any): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
        };
        creator: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        title: string;
        body: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        recurringValue: number;
        recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
        notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
        paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
        enablePaymentReminders: boolean;
        includePaymentLink: boolean;
        reminderDaysBefore: number[];
        enableOverdueReminders: boolean;
        overdueReminderDays: number[];
    }>;
    remove(id: string, currentUser: any): Promise<{
        message: string;
    }>;
    getTemplateVariables(): Promise<{
        variables: {
            name: string;
            description: string;
        }[];
    }>;
    duplicateTemplate(id: string, currentUser: any): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
        };
        creator: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        isActive: boolean;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        createdBy: string;
        title: string;
        body: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        recurringValue: number;
        recurringInterval: import(".prisma/client").$Enums.RecurringInterval;
        notificationChannel: import(".prisma/client").$Enums.NotificationChannel;
        paymentProvider: import(".prisma/client").$Enums.PaymentProvider;
        enablePaymentReminders: boolean;
        includePaymentLink: boolean;
        reminderDaysBefore: number[];
        enableOverdueReminders: boolean;
        overdueReminderDays: number[];
    }>;
    getTemplateAnalytics(id: string, currentUser: any): Promise<{
        template: {
            id: string;
            title: string;
        };
        metrics: {
            totalSubscribers: number;
            totalPayments: number;
            successfulPayments: number;
            pendingPayments: number;
            failedPayments: number;
            totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
            successRate: number;
        };
    }>;
}
