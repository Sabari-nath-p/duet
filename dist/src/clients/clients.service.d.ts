import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto, WhatsappConfigDto, EmailConfigDto, PaymentConfigDto } from './dto/client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createClientDto: CreateClientDto, currentUserId: string): Promise<{
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
    findAll(currentUser: any, page?: number, limit?: number): Promise<{
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
    findOne(id: string, currentUser: any): Promise<{
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
    update(id: string, updateClientDto: UpdateClientDto, currentUser: any): Promise<{
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
    remove(id: string, currentUser: any): Promise<{
        message: string;
    }>;
    updateWhatsappConfig(clientId: string, config: WhatsappConfigDto, currentUser: any): Promise<{
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
    updateEmailConfig(clientId: string, config: EmailConfigDto, currentUser: any): Promise<{
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
    updatePaymentConfig(clientId: string, config: PaymentConfigDto, currentUser: any): Promise<{
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
    getConfigurations(clientId: string, currentUser: any): Promise<{
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
}
