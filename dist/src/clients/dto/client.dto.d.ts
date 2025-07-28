export declare class CreateClientDto {
    name: string;
    email: string;
    phone?: string;
    description?: string;
    isActive?: boolean;
}
export declare class UpdateClientDto {
    name?: string;
    phone?: string;
    description?: string;
    isActive?: boolean;
}
export declare class WhatsappConfigDto {
    businessApiKey: string;
    phoneNumberId: string;
    accessToken: string;
    webhookSecret?: string;
}
export declare class EmailConfigDto {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
}
export declare class PaymentConfigDto {
    provider: 'RAZORPAY' | 'STRIPE';
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
}
