export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    WHATSAPP = "WHATSAPP",
    BOTH = "BOTH"
}
export declare enum NotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED"
}
export declare class CreateNotificationDto {
    userId: string;
    userSubscriptionId?: string;
    channel: NotificationChannel;
    message: string;
    subject?: string;
    templateVariables?: Record<string, any>;
}
declare const UpdateNotificationDto_base: import("@nestjs/common").Type<Partial<CreateNotificationDto>>;
export declare class UpdateNotificationDto extends UpdateNotificationDto_base {
    status?: NotificationStatus;
    providerResponse?: any;
    errorMessage?: string;
}
export declare class SendBulkNotificationDto {
    userIds: string[];
    userSubscriptionIds?: string[];
    channel: NotificationChannel;
    message: string;
    subject?: string;
    templateVariables?: Record<string, any>;
}
export declare class TestNotificationDto {
    recipient: string;
    channel: NotificationChannel;
    message: string;
    subject?: string;
}
export declare class CreateGeneralReminderDto {
    userId: string;
    channel: NotificationChannel;
    message: string;
    subject?: string;
    templateVariables?: Record<string, any>;
}
export {};
