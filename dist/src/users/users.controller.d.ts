import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, req: any): Promise<{
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
    findAll(req: any, page?: number, limit?: number): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    updateCustomFields(id: string, customFields: {
        fieldId: string;
        value: string;
    }[], req: any): Promise<{
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
    updateBillingStartDate(id: string, billingStartDate: string, req: any): Promise<{
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
