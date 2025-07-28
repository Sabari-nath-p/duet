import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto, currentUser: any): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdById: string;
        } | null;
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        clientId: string | null;
        billingStartDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(currentUser: any, page?: number, limit?: number): Promise<{
        data: {
            client: {
                id: string;
                email: string;
                name: string;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                createdById: string;
            } | null;
            id: string;
            email: string;
            name: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            clientId: string | null;
            billingStartDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, currentUser: any): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdById: string;
        } | null;
        customFields: ({
            customFieldDefinition: {
                id: string;
                clientId: string;
                createdAt: Date;
                updatedAt: Date;
                fieldName: string;
                fieldType: string;
                isRequired: boolean;
                options: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            userId: string;
            value: string;
            customFieldDefinitionId: string;
        })[];
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        clientId: string | null;
        billingStartDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdById: string;
        } | null;
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        clientId: string | null;
        billingStartDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, currentUser: any): Promise<{
        message: string;
    }>;
    findByEmail(email: string, clientId?: string): Promise<({
        client: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdById: string;
        } | null;
    } & {
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
    }) | null>;
    updateCustomFields(userId: string, customFields: {
        fieldId: string;
        value: string;
    }[], currentUser: any): Promise<{
        client: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            createdById: string;
        } | null;
        customFields: ({
            customFieldDefinition: {
                id: string;
                clientId: string;
                createdAt: Date;
                updatedAt: Date;
                fieldName: string;
                fieldType: string;
                isRequired: boolean;
                options: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            userId: string;
            value: string;
            customFieldDefinitionId: string;
        })[];
        id: string;
        email: string;
        name: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        clientId: string | null;
        billingStartDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    calculateNextPaymentDate(billingStartDate: Date, recurringInterval: string, recurringValue: number, currentDate?: Date): Date;
    updateBillingStartDate(userId: string, billingStartDate: string, currentUser: any): Promise<{
        user: {
            client: {
                id: string;
                email: string;
                name: string;
                phone: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                createdById: string;
            } | null;
            id: string;
            email: string;
            name: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            clientId: string | null;
            billingStartDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
        affectedSubscriptions: number;
    }>;
}
