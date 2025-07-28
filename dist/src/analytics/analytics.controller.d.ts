import { AnalyticsService } from './analytics.service';
import { GetAnalyticsDto } from './dto/analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboardAnalytics(req: any, getAnalyticsDto: GetAnalyticsDto): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        payments: {
            total: number;
            completed: number;
            pending: number;
            failed: number;
            totalAmount: number | import("@prisma/client/runtime/library").Decimal;
            averageAmount: number | import("@prisma/client/runtime/library").Decimal;
            successRate: number;
        };
        notifications: {
            total: number;
            sent: number;
            delivered: number;
            failed: number;
            pending: number;
            email: number;
            whatsapp: number;
            deliveryRate: number;
        };
        subscriptions: {
            total: number;
            active: number;
            inactive: number;
            activeRate: number;
        };
        revenue: {
            total: number | import("@prisma/client/runtime/library").Decimal;
        };
        topTemplates: {
            id: string;
            _count: {
                userSubscriptions: number;
            };
            title: string;
        }[];
        recentActivity: never[];
    }>;
    getPaymentAnalytics(req: any, getAnalyticsDto: GetAnalyticsDto): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        overview: {
            total: number;
            completed: number;
            pending: number;
            failed: number;
            totalAmount: number | import("@prisma/client/runtime/library").Decimal;
            averageAmount: number | import("@prisma/client/runtime/library").Decimal;
            successRate: number;
        };
        statusBreakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        providerBreakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "provider"[]> & {
            _count: number;
        })[];
        trends: {
            daily: never[];
            monthly: never[];
        };
    }>;
    getRevenueAnalytics(req: any, getAnalyticsDto: GetAnalyticsDto): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        totalRevenue: 0 | import("@prisma/client/runtime/library").Decimal;
        monthlyRevenue: never[];
        revenueByTemplate: never[];
        averagePaymentValue: 0 | import("@prisma/client/runtime/library").Decimal;
        recurringRevenue: {
            monthly: number;
            annual: number;
        };
    }>;
    getTemplateAnalytics(templateId: string, req: any, getAnalyticsDto: GetAnalyticsDto): Promise<{
        template: {
            id: string;
            title: string;
            client: string;
        };
        period: {
            start: Date;
            end: Date;
        };
        subscriptions: {
            total: number;
            active: number;
            growth: number;
        };
        payments: {
            total: number;
            completed: number;
            revenue: number;
        };
        notifications: {
            total: number;
            sent: number;
            deliveryRate: number;
        };
        performance: {
            conversionRate: number;
            averagePaymentTime: number;
            customerSatisfaction: number;
        };
    }>;
}
