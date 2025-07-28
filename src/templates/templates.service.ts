import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(createTemplateDto: CreateTemplateDto, currentUser: any) {
    // Only clients and super admins can create templates
    if (currentUser.role === 'CLIENT_USER') {
      throw new ForbiddenException('Client users cannot create templates');
    }

    const clientId = currentUser.role === 'SUPER_ADMIN' ? null : currentUser.clientId;

    if (!clientId && currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Client ID is required for non-super-admin users');
    }

    const template = await this.prisma.template.create({
      data: {
        title: createTemplateDto.title,
        body: createTemplateDto.body,
        amount: createTemplateDto.amount,
        recurringValue: createTemplateDto.recurringValue,
        recurringInterval: createTemplateDto.recurringInterval,
        notificationChannel: createTemplateDto.notificationChannel,
        paymentProvider: createTemplateDto.paymentProvider,
        isActive: createTemplateDto.isActive ?? true,
        clientId: clientId || currentUser.clientId,
        createdBy: currentUser.id,
        
        // Payment reminder options
        enablePaymentReminders: createTemplateDto.enablePaymentReminders ?? true,
        includePaymentLink: createTemplateDto.includePaymentLink ?? true,
        reminderDaysBefore: createTemplateDto.reminderDaysBefore ?? [7, 3, 1],
        enableOverdueReminders: createTemplateDto.enableOverdueReminders ?? true,
        overdueReminderDays: createTemplateDto.overdueReminderDays ?? [1, 3, 7],
      },
      include: {
        client: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return template;
  }

  async findAll(currentUser: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    // Apply role-based filtering
    if (currentUser.role === 'CLIENT' || currentUser.role === 'CLIENT_USER') {
      whereCondition.clientId = currentUser.clientId;
    }

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where: whereCondition,
        include: {
          client: {
            select: { id: true, name: true, email: true },
          },
          creator: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: {
              userSubscriptions: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.template.count({ where: whereCondition }),
    ]);

    return {
      data: templates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser: any) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        userSubscriptions: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && template.clientId !== currentUser.clientId) {
      throw new ForbiddenException('You can only access templates from your organization');
    }

    return template;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto, currentUser: any) {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && template.clientId !== currentUser.clientId) {
      throw new ForbiddenException('You can only update templates from your organization');
    }

    // Only template creators or super admins can update templates
    if (currentUser.role !== 'SUPER_ADMIN' && template.createdBy !== currentUser.id) {
      throw new ForbiddenException('You can only update templates you created');
    }

    const updatedTemplate = await this.prisma.template.update({
      where: { id },
      data: updateTemplateDto,
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updatedTemplate;
  }

  async remove(id: string, currentUser: any) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userSubscriptions: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && template.clientId !== currentUser.clientId) {
      throw new ForbiddenException('You can only delete templates from your organization');
    }

    // Only template creators or super admins can delete templates
    if (currentUser.role !== 'SUPER_ADMIN' && template.createdBy !== currentUser.id) {
      throw new ForbiddenException('You can only delete templates you created');
    }

    // Check if template is being used
    if (template._count.userSubscriptions > 0) {
      throw new ConflictException('Cannot delete template that is being used by user subscriptions');
    }

    await this.prisma.template.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  }

  async getTemplateVariables() {
    return {
      variables: [
        { name: 'user_name', description: 'Name of the user' },
        { name: 'user_email', description: 'Email of the user' },
        { name: 'user_phone', description: 'Phone number of the user' },
        { name: 'amount', description: 'Payment amount' },
        { name: 'payment_link', description: 'Unique payment link' },
        { name: 'due_date', description: 'Payment due date' },
        { name: 'client_name', description: 'Name of the client/business' },
        { name: 'template_title', description: 'Title of the template' },
      ],
    };
  }

  async duplicateTemplate(id: string, currentUser: any) {
    const originalTemplate = await this.findOne(id, currentUser);

    const duplicatedTemplate = await this.prisma.template.create({
      data: {
        title: `${originalTemplate.title} (Copy)`,
        body: originalTemplate.body,
        amount: originalTemplate.amount,
        recurringValue: originalTemplate.recurringValue,
        recurringInterval: originalTemplate.recurringInterval,
        notificationChannel: originalTemplate.notificationChannel,
        paymentProvider: originalTemplate.paymentProvider,
        isActive: false, // Duplicated templates start as inactive
        clientId: originalTemplate.clientId,
        createdBy: currentUser.id,
      },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return duplicatedTemplate;
  }

  async getTemplateAnalytics(id: string, currentUser: any) {
    const template = await this.findOne(id, currentUser);

    const analytics = await this.prisma.$transaction([
      // Total subscribers
      this.prisma.userSubscription.count({
        where: { templateId: id, isActive: true },
      }),
      // Total payments generated
      this.prisma.payment.count({
        where: {
          userSubscription: { templateId: id },
        },
      }),
      // Successful payments
      this.prisma.payment.count({
        where: {
          userSubscription: { templateId: id },
          status: 'COMPLETED',
        },
      }),
      // Total revenue
      this.prisma.payment.aggregate({
        where: {
          userSubscription: { templateId: id },
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
      // Pending payments
      this.prisma.payment.count({
        where: {
          userSubscription: { templateId: id },
          status: 'PENDING',
        },
      }),
    ]);

    const [
      totalSubscribers,
      totalPayments,
      successfulPayments,
      revenueSum,
      pendingPayments,
    ] = analytics;

    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    return {
      template: {
        id: template.id,
        title: template.title,
      },
      metrics: {
        totalSubscribers,
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments: totalPayments - successfulPayments - pendingPayments,
        totalRevenue: revenueSum._sum.amount || 0,
        successRate: Math.round(successRate * 100) / 100,
      },
    };
  }
}
