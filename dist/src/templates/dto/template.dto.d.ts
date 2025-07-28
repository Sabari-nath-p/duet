export declare enum RecurringInterval {
    MINUTES = "MINUTES",
    HOURS = "HOURS",
    DAYS = "DAYS",
    WEEKS = "WEEKS",
    MONTHS = "MONTHS"
}
export declare enum NotificationChannel {
    WHATSAPP = "WHATSAPP",
    EMAIL = "EMAIL",
    BOTH = "BOTH"
}
export declare enum PaymentProvider {
    RAZORPAY = "RAZORPAY",
    STRIPE = "STRIPE"
}
export declare class CreateTemplateDto {
    title: string;
    body: string;
    amount: number;
    recurringValue: number;
    recurringInterval: RecurringInterval;
    notificationChannel: NotificationChannel;
    paymentProvider: PaymentProvider;
    isActive?: boolean;
    enablePaymentReminders?: boolean;
    includePaymentLink?: boolean;
    reminderDaysBefore?: number[];
    enableOverdueReminders?: boolean;
    overdueReminderDays?: number[];
}
export declare class UpdateTemplateDto {
    title?: string;
    body?: string;
    amount?: number;
    recurringValue?: number;
    recurringInterval?: RecurringInterval;
    notificationChannel?: NotificationChannel;
    paymentProvider?: PaymentProvider;
    isActive?: boolean;
}
