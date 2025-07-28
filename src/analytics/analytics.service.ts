import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetAnalyticsDto, AnalyticsPeriod } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardAnalytics(currentUser: any, getAnalyticsDto: GetAnalyticsDto) {
    const { startDate, endDate, period } = getAnalyticsDto;
    
    const dateRange = this.getDateRange(startDate, endDate, period);
    const whereCondition = this.buildWhereCondition(currentUser, dateRange);

    const [
      paymentStats,
      notificationStats,
      subscriptionStats,
      revenueData,
      topTemplates,
      recentActivity,
    ] = await Promise.all([
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

  async getPaymentAnalytics(currentUser: any, getAnalyticsDto: GetAnalyticsDto) {
    const { startDate, endDate, period, templateId } = getAnalyticsDto;
    
    const dateRange = this.getDateRange(startDate, endDate, period);
    let whereCondition = this.buildWhereCondition(currentUser, dateRange);

    if (templateId) {
      whereCondition.userSubscription = {
        ...whereCondition.userSubscription,
        templateId,
      };
    }

    const [
      overallStats,
      statusBreakdown,
      providerBreakdown,
      dailyTrends,
      monthlyTrends,
    ] = await Promise.all([
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

  async getNotificationAnalytics(currentUser: any, getAnalyticsDto: GetAnalyticsDto) {
    const { startDate, endDate, period, templateId } = getAnalyticsDto;
    
    const dateRange = this.getDateRange(startDate, endDate, period);
    let whereCondition = this.buildWhereCondition(currentUser, dateRange);

    if (templateId) {
      whereCondition.userSubscription = {
        ...whereCondition.userSubscription,
        templateId,
      };
    }

    const [
      overallStats,
      channelBreakdown,
      statusBreakdown,
      dailyTrends,
      deliveryRates,
    ] = await Promise.all([
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

  async getRevenueAnalytics(currentUser: any, getAnalyticsDto: GetAnalyticsDto) {
    const { startDate, endDate, period } = getAnalyticsDto;
    
    const dateRange = this.getDateRange(startDate, endDate, period);
    const whereCondition = this.buildWhereCondition(currentUser, dateRange);

    const [
      totalRevenue,
      monthlyRevenue,
      revenueByTemplate,
      averagePaymentValue,
      recurringRevenue,
    ] = await Promise.all([
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

  async getTemplateAnalytics(templateId: string, currentUser: any, getAnalyticsDto: GetAnalyticsDto) {
    // Verify user has access to this template
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
      include: { client: true },
    });

    if (!template) {
      throw new ForbiddenException('Template not found');
    }

    if (currentUser.role !== 'SUPER_ADMIN' && template.clientId !== currentUser.clientId) {
      throw new ForbiddenException('You can only access analytics for your organization templates');
    }

    const { startDate, endDate, period } = getAnalyticsDto;
    const dateRange = this.getDateRange(startDate, endDate, period);

    const [
      subscriptionStats,
      paymentStats,
      notificationStats,
      performanceMetrics,
    ] = await Promise.all([
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

  private getDateRange(startDate?: string, endDate?: string, period?: AnalyticsPeriod) {
    const end = endDate ? new Date(endDate) : new Date();
    let start: Date;

    if (startDate) {
      start = new Date(startDate);
    } else {
      start = new Date();
      switch (period) {
        case AnalyticsPeriod.DAILY:
          start.setDate(start.getDate() - 7); // Last 7 days
          break;
        case AnalyticsPeriod.WEEKLY:
          start.setDate(start.getDate() - 28); // Last 4 weeks
          break;
        case AnalyticsPeriod.YEARLY:
          start.setFullYear(start.getFullYear() - 1); // Last year
          break;
        default: // MONTHLY
          start.setMonth(start.getMonth() - 3); // Last 3 months
          break;
      }
    }

    return { start, end };
  }

  private buildWhereCondition(currentUser: any, dateRange: any) {
    let whereCondition: any = {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    };

    if (currentUser.role === 'CLIENT') {
      whereCondition.userSubscription = {
        template: { clientId: currentUser.clientId },
      };
    } else if (currentUser.role === 'CLIENT_USER') {
      whereCondition.userSubscription = {
        userId: currentUser.id,
      };
    }

    return whereCondition;
  }

  private async getPaymentStatistics(whereCondition: any) {
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

  private async getNotificationStatistics(whereCondition: any) {
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

  private async getSubscriptionStatistics(currentUser: any) {
    let whereCondition: any = {};

    if (currentUser.role === 'CLIENT') {
      whereCondition.template = { clientId: currentUser.clientId };
    } else if (currentUser.role === 'CLIENT_USER') {
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

  private async getRevenueData(whereCondition: any, period?: AnalyticsPeriod) {
    // Implementation for revenue analytics
    const revenue = await this.prisma.payment.aggregate({
      where: { ...whereCondition, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    return {
      total: revenue._sum.amount || 0,
    };
  }

  private async getTopPerformingTemplates(currentUser: any, dateRange: any, limit = 5) {
    let whereCondition: any = {};

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

  private async getRecentActivity(currentUser: any, limit: number) {
    // Mock implementation - combine recent payments and notifications
    return [];
  }

  private async getPaymentStatusBreakdown(whereCondition: any) {
    const breakdown = await this.prisma.payment.groupBy({
      by: ['status'],
      where: whereCondition,
      _count: true,
    });

    return breakdown;
  }

  private async getPaymentProviderBreakdown(whereCondition: any) {
    const breakdown = await this.prisma.payment.groupBy({
      by: ['provider'],
      where: whereCondition,
      _count: true,
    });

    return breakdown;
  }

  private async getPaymentTrends(whereCondition: any, groupBy: 'daily' | 'monthly') {
    // Mock implementation for trends
    return [];
  }

  private async getNotificationChannelBreakdown(whereCondition: any) {
    const breakdown = await this.prisma.notification.groupBy({
      by: ['channel'],
      where: whereCondition,
      _count: true,
    });

    return breakdown;
  }

  private async getNotificationStatusBreakdown(whereCondition: any) {
    const breakdown = await this.prisma.notification.groupBy({
      by: ['status'],
      where: whereCondition,
      _count: true,
    });

    return breakdown;
  }

  private async getNotificationTrends(whereCondition: any, groupBy: 'daily' | 'monthly') {
    // Mock implementation for trends
    return [];
  }

  private async getDeliveryRates(whereCondition: any) {
    const stats = await this.getNotificationStatistics(whereCondition);
    return {
      overall: stats.deliveryRate,
      email: 0, // Calculate email-specific delivery rate
      whatsapp: 0, // Calculate WhatsApp-specific delivery rate
    };
  }

  private async getTotalRevenue(whereCondition: any) {
    const revenue = await this.prisma.payment.aggregate({
      where: { ...whereCondition, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    return revenue._sum.amount || 0;
  }

  private async getMonthlyRevenue(whereCondition: any) {
    // Mock implementation for monthly revenue breakdown
    return [];
  }

  private async getRevenueByTemplate(currentUser: any, dateRange: any) {
    // Mock implementation for revenue by template
    return [];
  }

  private async getAveragePaymentValue(whereCondition: any) {
    const avg = await this.prisma.payment.aggregate({
      where: { ...whereCondition, status: 'COMPLETED' },
      _avg: { amount: true },
    });

    return avg._avg.amount || 0;
  }

  private async getRecurringRevenue(currentUser: any, dateRange: any) {
    // Mock implementation for recurring revenue
    return {
      monthly: 0,
      annual: 0,
    };
  }

  private async getTemplateSubscriptionStats(templateId: string, dateRange: any) {
    return {
      total: 0,
      active: 0,
      growth: 0,
    };
  }

  private async getTemplatePaymentStats(templateId: string, dateRange: any) {
    return {
      total: 0,
      completed: 0,
      revenue: 0,
    };
  }

  private async getTemplateNotificationStats(templateId: string, dateRange: any) {
    return {
      total: 0,
      sent: 0,
      deliveryRate: 0,
    };
  }

  private async getTemplatePerformanceMetrics(templateId: string, dateRange: any) {
    return {
      conversionRate: 0,
      averagePaymentTime: 0,
      customerSatisfaction: 0,
    };
  }
}
