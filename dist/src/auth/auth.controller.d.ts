import { AuthService, LoginDto, RegisterDto } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            clientId: any;
            client: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
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
    getProfile(req: any): any;
    refresh(req: any): Promise<{
        access_token: string;
    }>;
}
