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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const analytics_dto_1 = require("./dto/analytics.dto");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardAnalytics(currentUser, getAnalyticsDto) {
        const { startDate, endDate, period } = getAnalyticsDto;
        const dateRange = this.getDateRange(startDate, endDate, period);
        const whereCondition = this.buildWhereCondition(currentUser, dateRange);
        const [paymentStats, notificationStats, subscriptionStats, revenueData, topTemplates, recentActivity,] = await Promise.all([
            this.getPaymentStatistics(whereCondition),
            this.getNotificationStatistics(whereCondition),
            this.getSubscriptionStatistics(currentUser),
            this.getRevenueData(whereCondition, period),
            this.getTopPerformingTemplates(currentUser, dateRange),
            this.getRecentActivity(currentUser, 10),
        ]);
        return {
            period: dateRange,
            payments: paymentStats,
            notifications: notificationStats,
            subscriptions: subscriptionStats,
            revenue: revenueData,
            topTemplates,
            recentActivity,
        };
    }
    async getPaymentAnalytics(currentUser, getAnalyticsDto) {
        const { startDate, endDate, period, templateId } = getAnalyticsDto;
        const dateRange = this.getDateRange(startDate, endDate, period);
        let whereCondition = this.buildWhereCondition(currentUser, dateRange);
        if (templateId) {
            whereCondition.userSubscription = {
                ...whereCondition.userSubscription,
                templateId,
            };
        }
        const [overallStats, statusBreakdown, providerBreakdown, dailyTrends, monthlyTrends,] = await Promise.all([
            this.getPaymentStatistics(whereCondition),
            this.getPaymentStatusBreakdown(whereCondition),
            this.getPaymentProviderBreakdown(whereCondition),
            this.getPaymentTrends(whereCondition, 'daily'),
            this.getPaymentTrends(whereCondition, 'monthly'),
        ]);
        return {
            period: dateRange,
            overview: overallStats,
            statusBreakdown,
            providerBreakdown,
            trends: {
                daily: dailyTrends,
                monthly: monthlyTrends,
            },
        };
    }
    async getNotificationAnalytics(currentUser, getAnalyticsDto) {
        const { startDate, endDate, period, templateId } = getAnalyticsDto;
        const dateRange = this.getDateRange(startDate, endDate, period);
        let whereCondition = this.buildWhereCondition(currentUser, dateRange);
        if (templateId) {
            whereCondition.userSubscription = {
                ...whereCondition.userSubscription,
                templateId,
            };
        }
        const [overallStats, channelBreakdown, statusBreakdown, dailyTrends, deliveryRates,] = await Promise.all([
            this.getNotificationStatistics(whereCondition),
            this.getNotificationChannelBreakdown(whereCondition),
            this.getNotificationStatusBreakdown(whereCondition),
            this.getNotificationTrends(whereCondition, 'daily'),
            this.getDeliveryRates(whereCondition),
        ]);
        return {
            period: dateRange,
            overview: overallStats,
            channelBreakdown,
            statusBreakdown,
            deliveryRates,
            trends: {
                daily: dailyTrends,
            },
        };
    }
    async getRevenueAnalytics(currentUser, getAnalyticsDto) {
        const { startDate, endDate, period } = getAnalyticsDto;
        const dateRange = this.getDateRange(startDate, endDate, period);
        const whereCondition = this.buildWhereCondition(currentUser, dateRange);
        const [totalRevenue, monthlyRevenue, revenueByTemplate, averagePaymentValue, recurringRevenue,] = await Promise.all([
            this.getTotalRevenue(whereCondition),
            this.getMonthlyRevenue(whereCondition),
            this.getRevenueByTemplate(currentUser, dateRange),
            this.getAveragePaymentValue(whereCondition),
            this.getRecurringRevenue(currentUser, dateRange),
        ]);
        return {
            period: dateRange,
            totalRevenue,
            monthlyRevenue,
            revenueByTemplate,
            averagePaymentValue,
            recurringRevenue,
        };
    }
    async getTemplateAnalytics(templateId, currentUser, getAnalyticsDto) {
        const template = await this.prisma.template.findUnique({
            where: { id: templateId },
            include: { client: true },
        });
        if (!template) {
            throw new common_1.ForbiddenException('Template not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN' && template.clientId !== currentUser.clientId) {
            throw new common_1.ForbiddenException('You can only access analytics for your organization templates');
        }
        const { startDate, endDate, period } = getAnalyticsDto;
        const dateRange = this.getDateRange(startDate, endDate, period);
        const [subscriptionStats, paymentStats, notificationStats, performanceMetrics,] = await Promise.all([
            this.getTemplateSubscriptionStats(templateId, dateRange),
            this.getTemplatePaymentStats(templateId, dateRange),
            this.getTemplateNotificationStats(templateId, dateRange),
            this.getTemplatePerformanceMetrics(templateId, dateRange),
        ]);
        return {
            template: {
                id: template.id,
                title: template.title,
                client: template.client.name,
            },
            period: dateRange,
            subscriptions: subscriptionStats,
            payments: paymentStats,
            notifications: notificationStats,
            performance: performanceMetrics,
        };
    }
    getDateRange(startDate, endDate, period) {
        const end = endDate ? new Date(endDate) : new Date();
        let start;
        if (startDate) {
            start = new Date(startDate);
        }
        else {
            start = new Date();
            switch (period) {
                case analytics_dto_1.AnalyticsPeriod.DAILY:
                    start.setDate(start.getDate() - 7);
                    break;
                case analytics_dto_1.AnalyticsPeriod.WEEKLY:
                    start.setDate(start.getDate() - 28);
                    break;
                case analytics_dto_1.AnalyticsPeriod.YEARLY:
                    start.setFullYear(start.getFullYear() - 1);
                    break;
                default:
                    start.setMonth(start.getMonth() - 3);
                    break;
            }
        }
        return { start, end };
    }
    buildWhereCondition(currentUser, dateRange) {
        let whereCondition = {
            createdAt: {
                gte: dateRange.start,
                lte: dateRange.end,
            },
        };
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
        return whereCondition;
    }
    async getPaymentStatistics(whereCondition) {
        const stats = await this.prisma.$transaction([
            this.prisma.payment.count({ where: whereCondition }),
            this.prisma.payment.count({ where: { ...whereCondition, status: 'COMPLETED' } }),
            this.prisma.payment.count({ where: { ...whereCondition, status: 'PENDING' } }),
            this.prisma.payment.count({ where: { ...whereCondition, status: 'FAILED' } }),
            this.prisma.payment.aggregate({
                where: { ...whereCondition, status: 'COMPLETED' },
                _sum: { amount: true },
                _avg: { amount: true },
            }),
        ]);
        const [total, completed, pending, failed, aggregates] = stats;
        const successRate = total > 0 ? (completed / total) * 100 : 0;
        return {
            total,
            completed,
            pending,
            failed,
            totalAmount: aggregates._sum.amount || 0,
            averageAmount: aggregates._avg.amount || 0,
            successRate: Math.round(successRate * 100) / 100,
        };
    }
    async getNotificationStatistics(whereCondition) {
        const stats = await this.prisma.$transaction([
            this.prisma.notification.count({ where: whereCondition }),
            this.prisma.notification.count({ where: { ...whereCondition, status: 'SENT' } }),
            this.prisma.notification.count({ where: { ...whereCondition, status: 'DELIVERED' } }),
            this.prisma.notification.count({ where: { ...whereCondition, status: 'FAILED' } }),
            this.prisma.notification.count({ where: { ...whereCondition, channel: 'EMAIL' } }),
            this.prisma.notification.count({ where: { ...whereCondition, channel: 'WHATSAPP' } }),
        ]);
        const [total, sent, delivered, failed, email, whatsapp] = stats;
        const deliveryRate = total > 0 ? ((sent + delivered) / total) * 100 : 0;
        return {
            total,
            sent,
            delivered,
            failed,
            pending: total - sent - delivered - failed,
            email,
            whatsapp,
            deliveryRate: Math.round(deliveryRate * 100) / 100,
        };
    }
    async getSubscriptionStatistics(currentUser) {
        let whereCondition = {};
        if (currentUser.role === 'CLIENT') {
            whereCondition.template = { clientId: currentUser.clientId };
        }
        else if (currentUser.role === 'CLIENT_USER') {
            whereCondition.userId = currentUser.id;
        }
        const stats = await this.prisma.$transaction([
            this.prisma.userSubscription.count({ where: whereCondition }),
            this.prisma.userSubscription.count({ where: { ...whereCondition, isActive: true } }),
            this.prisma.userSubscription.count({ where: { ...whereCondition, isActive: false } }),
        ]);
        const [total, active, inactive] = stats;
        return {
            total,
            active,
            inactive,
            activeRate: total > 0 ? (active / total) * 100 : 0,
        };
    }
    async getRevenueData(whereCondition, period) {
        const revenue = await this.prisma.payment.aggregate({
            where: { ...whereCondition, status: 'COMPLETED' },
            _sum: { amount: true },
        });
        return {
            total: revenue._sum.amount || 0,
        };
    }
    async getTopPerformingTemplates(currentUser, dateRange, limit = 5) {
        let whereCondition = {};
        if (currentUser.role === 'CLIENT') {
            whereCondition.clientId = currentUser.clientId;
        }
        const templates = await this.prisma.template.findMany({
            where: whereCondition,
            select: {
                id: true,
                title: true,
                _count: {
                    select: {
                        userSubscriptions: {
                            where: {
                                payments: {
                                    some: {
                                        status: 'COMPLETED',
                                        createdAt: {
                                            gte: dateRange.start,
                                            lte: dateRange.end,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                userSubscriptions: {
                    _count: 'desc',
                },
            },
            take: limit,
        });
        return templates;
    }
    async getRecentActivity(currentUser, limit) {
        return [];
    }
    async getPaymentStatusBreakdown(whereCondition) {
        const breakdown = await this.prisma.payment.groupBy({
            by: ['status'],
            where: whereCondition,
            _count: true,
        });
        return breakdown;
    }
    async getPaymentProviderBreakdown(whereCondition) {
        const breakdown = await this.prisma.payment.groupBy({
            by: ['provider'],
            where: whereCondition,
            _count: true,
        });
        return breakdown;
    }
    async getPaymentTrends(whereCondition, groupBy) {
        return [];
    }
    async getNotificationChannelBreakdown(whereCondition) {
        const breakdown = await this.prisma.notification.groupBy({
            by: ['channel'],
            where: whereCondition,
            _count: true,
        });
        return breakdown;
    }
    async getNotificationStatusBreakdown(whereCondition) {
        const breakdown = await this.prisma.notification.groupBy({
            by: ['status'],
            where: whereCondition,
            _count: true,
        });
        return breakdown;
    }
    async getNotificationTrends(whereCondition, groupBy) {
        return [];
    }
    async getDeliveryRates(whereCondition) {
        const stats = await this.getNotificationStatistics(whereCondition);
        return {
            overall: stats.deliveryRate,
            email: 0,
            whatsapp: 0,
        };
    }
    async getTotalRevenue(whereCondition) {
        const revenue = await this.prisma.payment.aggregate({
            where: { ...whereCondition, status: 'COMPLETED' },
            _sum: { amount: true },
        });
        return revenue._sum.amount || 0;
    }
    async getMonthlyRevenue(whereCondition) {
        return [];
    }
    async getRevenueByTemplate(currentUser, dateRange) {
        return [];
    }
    async getAveragePaymentValue(whereCondition) {
        const avg = await this.prisma.payment.aggregate({
            where: { ...whereCondition, status: 'COMPLETED' },
            _avg: { amount: true },
        });
        return avg._avg.amount || 0;
    }
    async getRecurringRevenue(currentUser, dateRange) {
        return {
            monthly: 0,
            annual: 0,
        };
    }
    async getTemplateSubscriptionStats(templateId, dateRange) {
        return {
            total: 0,
            active: 0,
            growth: 0,
        };
    }
    async getTemplatePaymentStats(templateId, dateRange) {
        return {
            total: 0,
            completed: 0,
            revenue: 0,
        };
    }
    async getTemplateNotificationStats(templateId, dateRange) {
        return {
            total: 0,
            sent: 0,
            deliveryRate: 0,
        };
    }
    async getTemplatePerformanceMetrics(templateId, dateRange) {
        return {
            conversionRate: 0,
            averagePaymentTime: 0,
            customerSatisfaction: 0,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map