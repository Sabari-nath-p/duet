import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, WhatsappConfigDto, EmailConfigDto, PaymentConfigDto } from './dto/client.dto';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto, req: any): Promise<{
        whatsappConfig: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            businessApiKey: string;
            phoneNumberId: string;
            accessToken: string;
            webhookSecret: string | null;
        } | null;
        emailConfig: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            smtpHost: string;
            smtpPort: number;
            smtpUser: string;
            smtpPassword: string;
            fromEmail: string;
            fromName: string;
        } | null;
        paymentConfigs: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            publicKey: string;
            webhookSecret: string;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            secretKey: string;
        }[];
        createdBy: {
            id: string;
            email: string;
            password: string | null;
            name: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            clientId: string | null;
            billingStartDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        email: string;
        name: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdById: string;
    }>;
    findAll(req: any, page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                templates: number;
                payments: number;
                users: number;
            };
            createdBy: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdById: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, req: any): Promise<{
        _count: {
            templates: number;
            userSubscriptions: number;
            payments: number;
            users: number;
        };
        whatsappConfig: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            businessApiKey: string;
            phoneNumberId: string;
            accessToken: string;
            webhookSecret: string | null;
        } | null;
        emailConfig: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            smtpHost: string;
            smtpPort: number;
            smtpUser: string;
            smtpPassword: string;
            fromEmail: string;
            fromName: string;
        } | null;
        paymentConfigs: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            publicKey: string;
            webhookSecret: string;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            secretKey: string;
        }[];
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
        customFieldDefs: {
            id: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            fieldName: string;
            fieldType: string;
            isRequired: boolean;
            options: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        email: string;
        name: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdById: string;
    }>;
    update(id: string, updateClientDto: UpdateClientDto, req: any): Promise<{
        whatsappConfig: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            businessApiKey: string;
            phoneNumberId: string;
            accessToken: string;
            webhookSecret: string | null;
        } | null;
        emailConfig: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            smtpHost: string;
            smtpPort: number;
            smtpUser: string;
            smtpPassword: string;
            fromEmail: string;
            fromName: string;
        } | null;
        paymentConfigs: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            publicKey: string;
            webhookSecret: string;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            secretKey: string;
        }[];
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        email: string;
        name: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        createdById: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    getConfigurations(id: string, req: any): Promise<{
        whatsappConfig: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            businessApiKey: string;
            phoneNumberId: string;
            accessToken: string;
            webhookSecret: string | null;
        } | null;
        emailConfig: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            smtpHost: string;
            smtpPort: number;
            smtpUser: string;
            smtpPassword: string;
            fromEmail: string;
            fromName: string;
        } | null;
        paymentConfigs: {
            id: string;
            isActive: boolean;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            publicKey: string;
            webhookSecret: string;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            secretKey: string;
        }[];
    }>;
    updateWhatsappConfig(id: string, config: WhatsappConfigDto, req: any): Promise<{
        id: string;
        isActive: boolean;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        businessApiKey: string;
        phoneNumberId: string;
        accessToken: string;
        webhookSecret: string | null;
    }>;
    updateEmailConfig(id: string, config: EmailConfigDto, req: any): Promise<{
        id: string;
        isActive: boolean;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        smtpHost: string;
        smtpPort: number;
        smtpUser: string;
        smtpPassword: string;
        fromEmail: string;
        fromName: string;
    }>;
    updatePaymentConfig(id: string, config: PaymentConfigDto, req: any): Promise<{
        id: string;
        isActive: boolean;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        publicKey: string;
        webhookSecret: string;
        provider: import(".prisma/client").$Enums.PaymentProvider;
        secretKey: string;
    }>;
}
