export declare enum PaymentProvider {
    RAZORPAY = "RAZORPAY",
    STRIPE = "STRIPE"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    EXPIRED = "EXPIRED"
}
export declare class CreatePaymentDto {
    userSubscriptionId: string;
    amount: number;
    currency?: string;
    provider: PaymentProvider;
    dueDate: string;
    description?: string;
}
declare const UpdatePaymentDto_base: import("@nestjs/common").Type<Partial<CreatePaymentDto>>;
export declare class UpdatePaymentDto extends UpdatePaymentDto_base {
    status?: PaymentStatus;
    externalPaymentId?: string;
    gatewayResponse?: any;
}
export declare class PaymentWebhookDto {
    event: string;
    provider: PaymentProvider;
    payload: any;
    signature: string;
}
export declare class CreatePaymentLinkDto {
    userSubscriptionId: string;
    amount: number;
    description: string;
    dueDate: string;
    customerEmail?: string;
    customerPhone?: string;
}
export {};
