import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';
export declare class CronService {
    private prisma;
    private notificationsService;
    private paymentsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, paymentsService: PaymentsService);
    handleDailyPaymentReminders(): Promise<void>;
    handleOverduePayments(): Promise<void>;
    handleRecurringPayments(): Promise<void>;
    handleWeeklyCleanup(): Promise<void>;
    handleMonthlyAnalytics(): Promise<void>;
    private createRecurringPayment;
    private calculateNextDueDate;
    private calculateNextDueDateFromBillingStart;
    private generateClientMonthlyAnalytics;
    private generateReminderMessage;
    private generateOverdueMessage;
}
