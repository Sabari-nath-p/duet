import { PrismaService } from '../prisma/prisma.service';
export declare class WebhooksService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processRazorpayWebhook(payload: any, signature: string): Promise<{
        status: string;
        message: string;
    }>;
    handleStripeWebhook(payload: any, signature: string): Promise<{
        status: string;
        message: string;
    }>;
    handleWhatsAppWebhook(payload: any, signature?: string): Promise<{
        status: string;
        message: string;
    }>;
    getWebhookLogs(currentUser: any, page?: number, limit?: number): Promise<{
        data: {
            error: string | null;
            id: string;
            createdAt: Date;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            payload: import("@prisma/client/runtime/library").JsonValue;
            signature: string | null;
            processed: boolean;
            webhookEndpointId: string;
            eventType: string;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    private handlePaymentCaptured;
    private handlePaymentFailed;
    private handlePaymentLinkPaid;
    private handlePaymentLinkExpired;
    private handleStripeCheckoutCompleted;
    private handleStripeCheckoutExpired;
    private handleStripePaymentSucceeded;
    private handleStripePaymentFailed;
    private handleStripeInvoicePaymentSucceeded;
    private handleStripeSubscriptionCreated;
    private handleStripeSubscriptionDeleted;
    private handleWhatsAppMessage;
    private handleWhatsAppStatus;
    private updatePaymentStatus;
    private logWebhookEvent;
    private verifyRazorpaySignature;
    private verifyStripeSignature;
    private verifyWhatsAppSignature;
}
