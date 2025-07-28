import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    handleRazorpayWebhook(payload: any, signature: string): Promise<{
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
    getWebhookLogs(req: any, page?: string, limit?: string): Promise<{
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
}
