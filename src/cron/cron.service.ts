import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private paymentsService: PaymentsService,
  ) {}

  // Run every day at 9:00 AM to check for due payments and send reminders
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyPaymentReminders() {
    this.logger.debug('Starting daily payment reminders check...');

    try {
      // Find payments due in the next 7 days that haven't been completed
      const upcomingPayments = await this.prisma.payment.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
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
        if (!template) continue;

        // Check if payment reminders are enabled for this template
        if (!template.enablePaymentReminders) {
          this.logger.debug(`Payment reminders disabled for template ${template.id}, skipping payment ${payment.id}`);
          continue;
        }

        const daysUntilDue = payment.dueDate ? 
          Math.ceil((payment.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

        // Check if we should send a reminder for this number of days
        const shouldSendReminder = template.reminderDaysBefore.includes(daysUntilDue) || daysUntilDue === 0;

        if (!shouldSendReminder) {
          continue;
        }

        // Generate reminder message based on template settings
        let reminderMessage = this.generateReminderMessage(
          payment, 
          template, 
          daysUntilDue
        );

        if (reminderMessage) {
          await this.notificationsService.create(
            {
              userId: payment.userId,
              userSubscriptionId: payment.userSubscriptionId,
              channel: template.notificationChannel as any,
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
            },
            { id: 'system', role: 'SUPER_ADMIN' }, // System user
          );

          this.logger.log(
            `Sent payment reminder to ${payment.userSubscription.user.email} for payment ${payment.id}`,
          );
        }
      }

      this.logger.debug(`Processed ${upcomingPayments.length} upcoming payments`);
    } catch (error) {
      this.logger.error('Error in daily payment reminders:', error);
    }
  }

  // Run daily to check for overdue payments
  @Cron('0 10 * * *') // Run at 10 AM daily
  async handleOverduePayments() {
    this.logger.debug('Starting overdue payment reminders...');

    try {
      // Find overdue payments
      const overduePayments = await this.prisma.payment.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: new Date(), // Due date is in the past
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
        if (!template) continue;

        // Check if overdue reminders are enabled for this template
        if (!template.enableOverdueReminders) {
          this.logger.debug(`Overdue reminders disabled for template ${template.id}, skipping payment ${payment.id}`);
          continue;
        }

        const daysOverdue = payment.dueDate ? 
          Math.floor((new Date().getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        // Check if we should send an overdue reminder for this number of days
        const shouldSendReminder = template.overdueReminderDays.includes(daysOverdue);

        if (!shouldSendReminder) {
          continue;
        }

        // Generate overdue reminder message
        const reminderMessage = this.generateOverdueMessage(payment, template, daysOverdue);

        if (reminderMessage) {
          await this.notificationsService.create(
            {
              userId: payment.userId,
              userSubscriptionId: payment.userSubscriptionId,
              channel: template.notificationChannel as any,
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
            },
            { id: 'system', role: 'SUPER_ADMIN' }, // System user
          );

          this.logger.log(
            `Sent overdue payment reminder to ${payment.userSubscription.user.email} for payment ${payment.id} (${daysOverdue} days overdue)`,
          );
        }
      }

      this.logger.debug(`Processed ${overduePayments.length} overdue payments`);
    } catch (error) {
      this.logger.error('Error in overdue payment reminders:', error);
    }
  }

  // Run every hour to create recurring payments
  @Cron(CronExpression.EVERY_HOUR)
  async handleRecurringPayments() {
    this.logger.debug('Starting recurring payments check...');

    try {
      // Find active user subscriptions with recurring payments
      const activeSubscriptions = await this.prisma.userSubscription.findMany({
        where: {
          isActive: true,
          template: {
            recurringInterval: {
              not: null,
            } as any,
            recurringValue: {
              not: null,
            } as any,
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
          // Create first payment if none exists
          await this.createRecurringPayment(subscription);
          continue;
        }

        const template = subscription.template;
        if (!template) continue;

        // Check if it's time for the next payment
        const nextDueDate = this.calculateNextDueDate(
          lastPayment.dueDate || new Date(),
          template.recurringInterval,
          template.recurringValue,
        );

        const now = new Date();
        const daysDifference = Math.ceil((nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Create payment 30 days before due date
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
    } catch (error) {
      this.logger.error('Error in recurring payments:', error);
    }
  }

  // Run every week to clean up old notifications
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyCleanup() {
    this.logger.debug('Starting weekly cleanup...');

    try {
      // Delete notifications older than 30 days
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

      // Update overdue payments to failed status
      const overduePayments = await this.prisma.payment.updateMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days overdue
          },
        },
        data: {
          status: 'FAILED' as any,
        },
      });

      this.logger.log(`Marked ${overduePayments.count} overdue payments as failed`);
    } catch (error) {
      this.logger.error('Error in weekly cleanup:', error);
    }
  }

  // Run once per month to generate analytics summaries
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
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

      // Generate analytics for each client
      const clients = await this.prisma.client.findMany({
        select: { id: true, name: true, email: true },
      });

      for (const client of clients) {
        const analytics = await this.generateClientMonthlyAnalytics(client.id, lastMonth, thisMonth);
        
        // Store analytics in database or send report
        this.logger.log(`Generated monthly analytics for client ${client.name}:`, analytics);
      }

      this.logger.debug(`Generated monthly analytics for ${clients.length} clients`);
    } catch (error) {
      this.logger.error('Error in monthly analytics generation:', error);
    }
  }

  private async createRecurringPayment(subscription: any, dueDate?: Date) {
    // Use user's billing start date if available, otherwise use current date
    const billingStartDate = subscription.user.billingStartDate || new Date();
    
    const nextDueDate = dueDate || this.calculateNextDueDateFromBillingStart(
      billingStartDate,
      subscription.template.recurringInterval,
      subscription.template.recurringValue,
    );

    await this.paymentsService.create(
      {
        userSubscriptionId: subscription.id,
        amount: subscription.template.amount,
        currency: 'INR',
        provider: subscription.template.paymentProvider,
        dueDate: nextDueDate.toISOString(),
        description: `Recurring payment for ${subscription.template.title}`,
      },
      { id: 'system', role: 'SUPER_ADMIN' }, // System user
    );

    this.logger.log(
      `Created recurring payment for user ${subscription.user.email}, due: ${nextDueDate.toLocaleDateString()} (based on billing start: ${billingStartDate.toLocaleDateString()})`,
    );
  }

  private calculateNextDueDate(
    lastDueDate: Date,
    recurringInterval: string,
    recurringValue: number,
  ): Date {
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
        nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
        break;
    }

    return nextDate;
  }

  /**
   * Calculate next payment date based on user's billing start date
   */
  private calculateNextDueDateFromBillingStart(
    billingStartDate: Date,
    recurringInterval: string,
    recurringValue: number,
    currentDate = new Date()
  ): Date {
    const startDate = new Date(billingStartDate);
    const nextPaymentDate = new Date(startDate);

    // Calculate how many billing cycles have passed since the start date
    const timeDiff = currentDate.getTime() - startDate.getTime();
    
    let intervalInMilliseconds: number;
    
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
        // For months, we need to handle differently due to varying month lengths
        const monthsToAdd = Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000 * recurringValue)) * recurringValue;
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsToAdd);
        
        // Find the next payment date
        while (nextPaymentDate <= currentDate) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + recurringValue);
        }
        return nextPaymentDate;
      case 'YEARLY':
        const yearsToAdd = Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000 * recurringValue)) * recurringValue;
        nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + yearsToAdd);
        
        // Find the next payment date
        while (nextPaymentDate <= currentDate) {
          nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + recurringValue);
        }
        return nextPaymentDate;
      default:
        throw new Error(`Unsupported recurring interval: ${recurringInterval}`);
    }

    // Calculate how many complete cycles have passed
    const cyclesPassed = Math.floor(timeDiff / intervalInMilliseconds);
    
    // Add cycles to get the next payment date
    nextPaymentDate.setTime(startDate.getTime() + ((cyclesPassed + 1) * intervalInMilliseconds));

    return nextPaymentDate;
  }

  private async generateClientMonthlyAnalytics(
    clientId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const analytics = await this.prisma.$transaction([
      // Total payments in the month
      this.prisma.payment.count({
        where: {
          userSubscription: { template: { clientId } },
          createdAt: { gte: startDate, lt: endDate },
        },
      }),
      // Successful payments
      this.prisma.payment.count({
        where: {
          userSubscription: { template: { clientId } },
          createdAt: { gte: startDate, lt: endDate },
          status: 'COMPLETED',
        },
      }),
      // Total revenue
      this.prisma.payment.aggregate({
        where: {
          userSubscription: { template: { clientId } },
          createdAt: { gte: startDate, lt: endDate },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      // Total notifications sent
      this.prisma.notification.count({
        where: {
          userSubscription: { template: { clientId } },
          createdAt: { gte: startDate, lt: endDate },
        },
      }),
      // Active subscriptions
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

  /**
   * Generate reminder message based on template settings
   */
  private generateReminderMessage(payment: any, template: any, daysUntilDue: number): string {
    const amount = `${payment.currency} ${payment.amount}`;
    const paymentLinkText = template.includePaymentLink && payment.paymentLink 
      ? ` Please complete your payment: ${payment.paymentLink}` 
      : '';

    if (daysUntilDue === 0) {
      return `Payment Due Today: Your payment of ${amount} is due today.${paymentLinkText}`;
    } else if (daysUntilDue === 1) {
      return `Payment Due Tomorrow: Your payment of ${amount} is due tomorrow.${paymentLinkText}`;
    } else if (daysUntilDue <= 3) {
      return `Payment Reminder: Your payment of ${amount} is due in ${daysUntilDue} days.${paymentLinkText}`;
    } else if (daysUntilDue <= 7) {
      return `Upcoming Payment: Your payment of ${amount} is due in ${daysUntilDue} days.${paymentLinkText}`;
    } else {
      return `Payment Reminder: Your payment of ${amount} is due in ${daysUntilDue} days.${paymentLinkText}`;
    }
  }

  /**
   * Generate overdue reminder message
   */
  private generateOverdueMessage(payment: any, template: any, daysOverdue: number): string {
    const amount = `${payment.currency} ${payment.amount}`;
    const paymentLinkText = template.includePaymentLink && payment.paymentLink 
      ? ` Please complete your payment immediately: ${payment.paymentLink}` 
      : '';

    if (daysOverdue === 1) {
      return `OVERDUE: Your payment of ${amount} was due yesterday.${paymentLinkText}`;
    } else {
      return `OVERDUE: Your payment of ${amount} is ${daysOverdue} days overdue.${paymentLinkText}`;
    }
  }
}
