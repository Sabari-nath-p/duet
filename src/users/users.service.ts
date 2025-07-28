import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserRole } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUser: any) {
    // Check if user already exists for this client
    const whereCondition: any = { email: createUserDto.email };
    if (createUserDto.clientId) {
      whereCondition.clientId = createUserDto.clientId;
    } else if (currentUser.clientId) {
      whereCondition.clientId = currentUser.clientId;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: whereCondition,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists for this client');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    }

    // Authorization checks
    if (currentUser.role === 'CLIENT' && createUserDto.role !== 'CLIENT_USER') {
      throw new ForbiddenException('Clients can only create CLIENT_USER accounts');
    }

    if (currentUser.role === 'CLIENT' && createUserDto.clientId !== currentUser.clientId) {
      throw new ForbiddenException('Clients can only create users for their own organization');
    }

    const userData: any = {
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

  async findAll(currentUser: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    let whereCondition: any = {};
    
    // Apply role-based filtering
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

  async findOne(id: string, currentUser: any) {
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
      throw new NotFoundException('User not found');
    }

    // Authorization check
    if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
      throw new ForbiddenException('You can only access users from your organization');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Authorization check
    if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
      throw new ForbiddenException('You can only update users from your organization');
    }

    // Prepare update data
    const updateData: any = { ...updateUserDto };
    
    // Handle billing start date conversion
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

  async remove(id: string, currentUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Authorization check
    if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
      throw new ForbiddenException('You can only delete users from your organization');
    }

    // Prevent self-deletion
    if (user.id === currentUser.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async findByEmail(email: string, clientId?: string) {
    const whereCondition: any = { email };
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

  async updateCustomFields(userId: string, customFields: { fieldId: string; value: string }[], currentUser: any) {
    const user = await this.findOne(userId, currentUser);

    // Delete existing custom field values
    await this.prisma.userCustomField.deleteMany({
      where: { userId },
    });

    // Create new custom field values
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

  /**
   * Calculate the next payment date based on user's billing start date and billing cycle
   */
  calculateNextPaymentDate(
    billingStartDate: Date,
    recurringInterval: string,
    recurringValue: number,
    currentDate = new Date()
  ): Date {
    const startDate = new Date(billingStartDate);
    const nextPaymentDate = new Date(startDate);

    // Calculate how many billing cycles have passed since the start date
    const timeDiff = currentDate.getTime() - startDate.getTime();
    
    let intervalInMilliseconds: number;
    
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
        // For months, we need to handle differently due to varying month lengths
        const monthsToAdd = Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000 * recurringValue)) * recurringValue;
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsToAdd);
        
        // Find the next payment date
        while (nextPaymentDate <= currentDate) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + recurringValue);
        }
        return nextPaymentDate;
      default:
        throw new Error(`Unsupported recurring interval: ${recurringInterval}`);
    }

    // Calculate how many complete cycles have passed
    const cyclesPassed = Math.floor(timeDiff / intervalInMilliseconds);
    
    // Add cycles to get the next payment date
    nextPaymentDate.setTime(startDate.getTime() + ((cyclesPassed + 1) * intervalInMilliseconds));

    return nextPaymentDate;
  }

  /**
   * Update user's billing start date and recalculate payment schedules
   */
  async updateBillingStartDate(userId: string, billingStartDate: string, currentUser: any) {
    const user = await this.findOne(userId, currentUser);
    
    // Update user's billing start date
    const updatedUser = await this.update(userId, { billingStartDate }, currentUser);

    // Update all active user subscriptions with new payment dates
    const userSubscriptions = await this.prisma.userSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    const newBillingStart = new Date(billingStartDate);

    for (const subscription of userSubscriptions) {
      const nextPaymentDate = this.calculateNextPaymentDate(
        newBillingStart,
        subscription.recurringInterval,
        subscription.recurringValue
      );

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
}
