"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto, currentUser) {
        const whereCondition = { email: createUserDto.email };
        if (createUserDto.clientId) {
            whereCondition.clientId = createUserDto.clientId;
        }
        else if (currentUser.clientId) {
            whereCondition.clientId = currentUser.clientId;
        }
        const existingUser = await this.prisma.user.findFirst({
            where: whereCondition,
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists for this client');
        }
        let hashedPassword;
        if (createUserDto.password) {
            hashedPassword = await bcrypt.hash(createUserDto.password, 12);
        }
        if (currentUser.role === 'CLIENT' && createUserDto.role !== 'CLIENT_USER') {
            throw new common_1.ForbiddenException('Clients can only create CLIENT_USER accounts');
        }
        if (currentUser.role === 'CLIENT' && createUserDto.clientId !== currentUser.clientId) {
            throw new common_1.ForbiddenException('Clients can only create users for their own organization');
        }
        const userData = {
            email: createUserDto.email,
            name: createUserDto.name,
            phone: createUserDto.phone,
            role: createUserDto.role,
            isActive: createUserDto.isActive ?? true,
            billingStartDate: createUserDto.billingStartDate ? new Date(createUserDto.billingStartDate) : null,
        };
        if (hashedPassword) {
            userData.password = hashedPassword;
        }
        if (createUserDto.clientId) {
            userData.clientId = createUserDto.clientId;
        }
        const user = await this.prisma.user.create({
            data: userData,
            include: {
                client: true,
            },
        });
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async findAll(currentUser, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        let whereCondition = {};
        if (currentUser.role === 'CLIENT') {
            whereCondition.clientId = currentUser.clientId;
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: whereCondition,
                include: {
                    client: true,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.user.count({ where: whereCondition }),
        ]);
        const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
        return {
            data: usersWithoutPasswords,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                client: true,
                customFields: {
                    include: {
                        customFieldDefinition: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
            throw new common_1.ForbiddenException('You can only access users from your organization');
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
            throw new common_1.ForbiddenException('You can only update users from your organization');
        }
        const updateData = { ...updateUserDto };
        if (updateUserDto.billingStartDate) {
            updateData.billingStartDate = new Date(updateUserDto.billingStartDate);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                client: true,
            },
        });
        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    async remove(id, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
            throw new common_1.ForbiddenException('You can only delete users from your organization');
        }
        if (user.id === currentUser.id) {
            throw new common_1.ForbiddenException('You cannot delete your own account');
        }
        await this.prisma.user.delete({
            where: { id },
        });
        return { message: 'User deleted successfully' };
    }
    async findByEmail(email, clientId) {
        const whereCondition = { email };
        if (clientId) {
            whereCondition.clientId = clientId;
        }
        return this.prisma.user.findFirst({
            where: whereCondition,
            include: {
                client: true,
            },
        });
    }
    async updateCustomFields(userId, customFields, currentUser) {
        const user = await this.findOne(userId, currentUser);
        await this.prisma.userCustomField.deleteMany({
            where: { userId },
        });
        if (customFields.length > 0) {
            await this.prisma.userCustomField.createMany({
                data: customFields.map(field => ({
                    userId,
                    customFieldDefinitionId: field.fieldId,
                    value: field.value,
                })),
            });
        }
        return this.findOne(userId, currentUser);
    }
    calculateNextPaymentDate(billingStartDate, recurringInterval, recurringValue, currentDate = new Date()) {
        const startDate = new Date(billingStartDate);
        const nextPaymentDate = new Date(startDate);
        const timeDiff = currentDate.getTime() - startDate.getTime();
        let intervalInMilliseconds;
        switch (recurringInterval) {
            case 'MINUTES':
                intervalInMilliseconds = recurringValue * 60 * 1000;
                break;
            case 'HOURS':
                intervalInMilliseconds = recurringValue * 60 * 60 * 1000;
                break;
            case 'DAYS':
                intervalInMilliseconds = recurringValue * 24 * 60 * 60 * 1000;
                break;
            case 'WEEKS':
                intervalInMilliseconds = recurringValue * 7 * 24 * 60 * 60 * 1000;
                break;
            case 'MONTHS':
                const monthsToAdd = Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000 * recurringValue)) * recurringValue;
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsToAdd);
                while (nextPaymentDate <= currentDate) {
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + recurringValue);
                }
                return nextPaymentDate;
            default:
                throw new Error(`Unsupported recurring interval: ${recurringInterval}`);
        }
        const cyclesPassed = Math.floor(timeDiff / intervalInMilliseconds);
        nextPaymentDate.setTime(startDate.getTime() + ((cyclesPassed + 1) * intervalInMilliseconds));
        return nextPaymentDate;
    }
    async updateBillingStartDate(userId, billingStartDate, currentUser) {
        const user = await this.findOne(userId, currentUser);
        const updatedUser = await this.update(userId, { billingStartDate }, currentUser);
        const userSubscriptions = await this.prisma.userSubscription.findMany({
            where: {
                userId,
                isActive: true,
            },
        });
        const newBillingStart = new Date(billingStartDate);
        for (const subscription of userSubscriptions) {
            const nextPaymentDate = this.calculateNextPaymentDate(newBillingStart, subscription.recurringInterval, subscription.recurringValue);
            await this.prisma.userSubscription.update({
                where: { id: subscription.id },
                data: { nextPaymentDate },
            });
        }
        return {
            user: updatedUser,
            message: 'Billing start date updated and payment schedules recalculated',
            affectedSubscriptions: userSubscriptions.length,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map