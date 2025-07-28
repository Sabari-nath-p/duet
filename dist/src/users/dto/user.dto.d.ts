export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    CLIENT = "CLIENT",
    CLIENT_USER = "CLIENT_USER"
}
export declare class CreateUserDto {
    email: string;
    name: string;
    phone?: string;
    password?: string;
    role: UserRole;
    clientId?: string;
    isActive?: boolean;
    billingStartDate?: string;
}
export declare class UpdateUserDto {
    name?: string;
    phone?: string;
    isActive?: boolean;
    clientId?: string;
    billingStartDate?: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    clientId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
