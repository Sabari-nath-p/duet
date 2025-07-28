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
var CronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const payments_service_1 = require("../payments/payments.service");
let CronService = CronService_1 = class CronService {
    prisma;
    notificationsService;
    paymentsService;
    logger = new common_1.Logger(CronService_1.name);
    constructor(prisma, notificationsService, paymentsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.paymentsService = paymentsService;
    }
    async handleDailyPaymentReminders() {
        this.logger.debug('Starting daily payment reminders check...');
        try {
            const upcomingPayments = await this.prisma.payment.findMany({
                where: {
                    status: 'PENDING',
                    dueDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
                include: {
                    userSubscription: {
                        include: {
                            user: true,
                            template: {
                                include: {
                                    client: true,
                                },
                            },
                        },
                    },
                },
            });
            for (const payment of upcomingPayments) {
                const template = payment.userSubscription?.template;
                if (!template)
                    continue;
                if (!template.enablePaymentReminders) {
                    this.logger.debug(`Payment reminders disabled for template ${template.id}, skipping payment ${payment.id}`);
                    continue;
                }
                const daysUntilDue = payment.dueDate ?
                    Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                const shouldSendReminder = template.reminderDaysBefore.includes(daysUntilDue) || daysUntilDue === 0;
                if (!shouldSendReminder) {
                    continue;
                }
                let reminderMessage = this.generateReminderMessage(payment, template, daysUntilDue);
                if (reminderMessage) {
                    await this.notificationsService.create({
                        userId: payment.userId,
                        userSubscriptionId: payment.userSubscriptionId,
                        channel: template.notificationChannel,
                        message: reminderMessage,
                        subject: `Payment Reminder - ${template.title}`,
                        templateVariables: {
                            amount: payment.amount,
                            currency: payment.currency,
                            due_date: payment.dueDate?.toLocaleDateString() || 'N/A',
                            payment_link: template.includePaymentLink ? payment.paymentLink : '',
                            days_until_due: daysUntilDue.toString(),
                            template_title: template.title,
                        },
                    }, { id: 'system', role: 'SUPER_ADMIN' });
                    this.logger.log(`Sent payment reminder to ${payment.userSubscription.user.email} for payment ${payment.id}`);
                }
            }
            this.logger.debug(`Processed ${upcomingPayments.length} upcoming payments`);
        }
        catch (error) {
            this.logger.error('Error in daily payment reminders:', error);
        }
    }
    async handleOverduePayments() {
        this.logger.debug('Starting overdue payment reminders...');
        try {
            const overduePayments = await this.prisma.payment.findMany({
                where: {
                    status: 'PENDING',
                    dueDate: {
                        lt: new Date(),
                    },
                },
                include: {
                    userSubscription: {
                        include: {
                            user: true,
                            template: true,
                        },
                    },
                },
            });
            for (const payment of overduePayments) {
                const template = payment.userSubscription?.template;
                if (!template)
                    continue;
                if (!template.enableOverdueReminders) {
                    this.logger.debug(`Overdue reminders disabled for template ${template.id}, skipping payment ${payment.id}`);
                    continue;
                }
                const daysOverdue = payment.dueDate ?
                    Math.floor((new Date().getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                const shouldSendReminder = template.overdueReminderDays.includes(daysOverdue);
                if (!shouldSendReminder) {
                    continue;
                }
                const reminderMessage = this.generateOverdueMessage(payment, template, daysOverdue);
                if (reminderMessage) {
                    await this.notificationsService.create({
                        userId: payment.userId,
                        userSubscriptionId: payment.userSubscriptionId,
                        channel: template.notificationChannel,
                        message: reminderMessage,
                        subject: `OVERDUE PAYMENT - ${template.title}`,
                        templateVariables: {
                            amount: payment.amount,
                            currency: payment.currency,
                            due_date: payment.dueDate?.toLocaleDateString() || 'N/A',
                            payment_link: template.includePaymentLink ? payment.paymentLink : '',
                            days_overdue: daysOverdue.toString(),
                            template_title: template.title,
                        },
                    }, { id: 'system', role: 'SUPER_ADMIN' });
                    this.logger.log(`Sent overdue payment reminder to ${payment.userSubscription.user.email} for payment ${payment.id} (${daysOverdue} days overdue)`);
                }
            }
            this.logger.debug(`Processed ${overduePayments.length} overdue payments`);
        }
        catch (error) {
            this.logger.error('Error in overdue payment reminders:', error);
        }
    }
    async handleRecurringPayments() {
        this.logger.debug('Starting recurring payments check...');
        try {
            const activeSubscriptions = await this.prisma.userSubscription.findMany({
                where: {
                    isActive: true,
                    template: {
                        recurringInterval: {
                            not: null,
                        },
                        recurringValue: {
                            not: null,
                        },
                    },
                },
                include: {
                    template: true,
                    user: true,
                    payments: {
                        orderBy: {
                            dueDate: 'desc',
                        },
                        take: 1,
                    },
                },
            });
            for (const subscription of activeSubscriptions) {
                const lastPayment = subscription.payments?.[0];
                if (!lastPayment) {
                    await this.createRecurringPayment(subscription);
                    continue;
                }
                const template = subscription.template;
                if (!template)
                    continue;
                const nextDueDate = this.calculateNextDueDate(lastPayment.dueDate || new Date(), template.recurringInterval, template.recurringValue);
                const now = new Date();
                const daysDifference = Math.ceil((nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDifference <= 30) {
                    const existingPayment = await this.prisma.payment.findFirst({
                        where: {
                            userSubscriptionId: subscription.id,
                            dueDate: nextDueDate,
                        },
                    });
                    if (!existingPayment) {
                        await this.createRecurringPayment(subscription, nextDueDate);
                    }
                }
            }
            this.logger.debug(`Processed ${activeSubscriptions.length} active subscriptions`);
        }
        catch (error) {
            this.logger.error('Error in recurring payments:', error);
        }
    }
    async handleWeeklyCleanup() {
        this.logger.debug('Starting weekly cleanup...');
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const deleteResult = await this.prisma.notification.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo,
                    },
                    status: {
                        in: ['SENT', 'DELIVERED', 'FAILED'],
                    },
                },
            });
            this.logger.log(`Cleaned up ${deleteResult.count} old notifications`);
            const overduePayments = await this.prisma.payment.updateMany({
                where: {
                    status: 'PENDING',
                    dueDate: {
                        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
                data: {
                    status: 'FAILED',
                },
            });
            this.logger.log(`Marked ${overduePayments.count} overdue payments as failed`);
        }
        catch (error) {
            this.logger.error('Error in weekly cleanup:', error);
        }
    }
    async handleMonthlyAnalytics() {
        this.logger.debug('Starting monthly analytics generation...');
        try {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            lastMonth.setDate(1);
            lastMonth.setHours(0, 0, 0, 0);
            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);
            const clients = await this.prisma.client.findMany({
                select: { id: true, name: true, email: true },
            });
            for (const client of clients) {
                const analytics = await this.generateClientMonthlyAnalytics(client.id, lastMonth, thisMonth);
                this.logger.log(`Generated monthly analytics for client ${client.name}:`, analytics);
            }
            this.logger.debug(`Generated monthly analytics for ${clients.length} clients`);
        }
        catch (error) {
            this.logger.error('Error in monthly analytics generation:', error);
        }
    }
    async createRecurringPayment(subscription, dueDate) {
        const billingStartDate = subscription.user.billingStartDate || new Date();
        const nextDueDate = dueDate || this.calculateNextDueDateFromBillingStart(billingStartDate, subscription.template.recurringInterval, subscription.template.recurringValue);
        await this.paymentsService.create({
            userSubscriptionId: subscription.id,
            amount: subscription.template.amount,
            currency: 'INR',
            provider: subscription.template.paymentProvider,
            dueDate: nextDueDate.toISOString(),
            description: `Recurring payment for ${subscription.template.title}`,
        }, { id: 'system', role: 'SUPER_ADMIN' });
        this.logger.log(`Created recurring payment for user ${subscription.user.email}, due: ${nextDueDate.toLocaleDateString()} (based on billing start: ${billingStartDate.toLocaleDateString()})`);
    }
    calculateNextDueDate(lastDueDate, recurringInterval, recurringValue) {
        const nextDate = new Date(lastDueDate);
        switch (recurringInterval) {
            case 'DAILY':
                nextDate.setDate(nextDate.getDate() + recurringValue);
                break;
            case 'WEEKLY':
                nextDate.setDate(nextDate.getDate() + (recurringValue * 7));
                break;
            case 'MONTHLY':
                nextDate.setMonth(nextDate.getMonth() + recurringValue);
                break;
            case 'YEARLY':
                nextDate.setFullYear(nextDate.getFullYear() + recurringValue);
                break;
            default:
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }
        return nextDate;
    }
    calculateNextDueDateFromBillingStart(billingStartDate, recurringInterval, recurringValue, currentDate = new Date()) {
        const startDate = new Date(billingStartDate);
        const nextPaymentDate = new Date(startDate);
        const timeDiff = currentDate.getTime() - startDate.getTime();
        let intervalInMilliseconds;
        switch (recurringInterval) {
            case 'MINUTES':
                intervalInMilliseconds = recurringValue * 60 * 1000;
                break;
            case 'HOURS':
                intervalInMilliseconds = recurringValue * 60 * 60 * 1000;
                break;
            case 'DAYS':
                intervalInMilliseconds = recurringValue * 24 * 60 * 60 * 1000;
                break;
            case 'WEEKS':
                intervalInMilliseconds = recurringValue * 7 * 24 * 60 * 60 * 1000;
                break;
            case 'MONTHS':
                const monthsToAdd = Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000 * recurringValue)) * recurringValue;
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsToAdd);
                while (nextPaymentDate <= currentDate) {
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + recurringValue);
                }
                return nextPaymentDate;
            case 'YEARLY':
                const yearsToAdd = Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000 * recurringValue)) * recurringValue;
                nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + yearsToAdd);
                while (nextPaymentDate <= currentDate) {
                    nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + recurringValue);
                }
                return nextPaymentDate;
            default:
                throw new Error(`Unsupported recurring interval: ${recurringInterval}`);
        }
        const cyclesPassed = Math.floor(timeDiff / intervalInMilliseconds);
        nextPaymentDate.setTime(startDate.getTime() + ((cyclesPassed + 1) * intervalInMilliseconds));
        return nextPaymentDate;
    }
    async generateClientMonthlyAnalytics(clientId, startDate, endDate) {
        const analytics = await this.prisma.$transaction([
            this.prisma.payment.count({
                where: {
                    userSubscription: { template: { clientId } },
                    createdAt: { gte: startDate, lt: endDate },
                },
            }),
            this.prisma.payment.count({
                where: {
                    userSubscription: { template: { clientId } },
                    createdAt: { gte: startDate, lt: endDate },
                    status: 'COMPLETED',
                },
            }),
            this.prisma.payment.aggregate({
                where: {
                    userSubscription: { template: { clientId } },
                    createdAt: { gte: startDate, lt: endDate },
                    status: 'COMPLETED',
                },
                _sum: { amount: true },
            }),
            this.prisma.notification.count({
                where: {
                    userSubscription: { template: { clientId } },
                    createdAt: { gte: startDate, lt: endDate },
                },
            }),
            this.prisma.userSubscription.count({
                where: {
                    template: { clientId },
                    isActive: true,
                },
            }),
        ]);
        const [totalPayments, successfulPayments, revenue, totalNotifications, activeSubscriptions] = analytics;
        return {
            period: {
                start: startDate,
                end: endDate,
            },
            payments: {
                total: totalPayments,
                successful: successfulPayments,
                successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
            },
            revenue: revenue._sum.amount || 0,
            notifications: totalNotifications,
            activeSubscriptions,
        };
    }
    generateReminderMessage(payment, template, daysUntilDue) {
        const amount = `${payment.currency} ${payment.amount}`;
        const paymentLinkText = template.includePaymentLink && payment.paymentLink
            ? ` Please complete your payment: ${payment.paymentLink}`
            : '';
        if (daysUntilDue === 0) {
            return `Payment Due Today: Your payment of ${amount} is due today.${paymentLinkText}`;
        }
        else if (daysUntilDue === 1) {
            return `Payment Due Tomorrow: Your payment of ${amount} is due tomorrow.${paymentLinkText}`;
        }
        else if (daysUntilDue <= 3) {
            return `Payment Reminder: Your payment of ${amount} is due in ${daysUntilDue} days.${paymentLinkText}`;
        }
        else if (daysUntilDue <= 7) {
            return `Upcoming Payment: Your payment of ${amount} is due in ${daysUntilDue} days.${paymentLinkText}`;
        }
        else {
            return `Payment Reminder: Your payment of ${amount} is due in ${daysUntilDue} days.${paymentLinkText}`;
        }
    }
    generateOverdueMessage(payment, template, daysOverdue) {
        const amount = `${payment.currency} ${payment.amount}`;
        const paymentLinkText = template.includePaymentLink && payment.paymentLink
            ? ` Please complete your payment immediately: ${payment.paymentLink}`
            : '';
        if (daysOverdue === 1) {
            return `OVERDUE: Your payment of ${amount} was due yesterday.${paymentLinkText}`;
        }
        else {
            return `OVERDUE: Your payment of ${amount} is ${daysOverdue} days overdue.${paymentLinkText}`;
        }
    }
};
exports.CronService = CronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleDailyPaymentReminders", null);
__decorate([
    (0, schedule_1.Cron)('0 10 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleOverduePayments", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleRecurringPayments", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_WEEK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleWeeklyCleanup", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleMonthlyAnalytics", null);
exports.CronService = CronService = CronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        payments_service_1.PaymentsService])
], CronService);
//# sourceMappingURL=cron.service.js.map