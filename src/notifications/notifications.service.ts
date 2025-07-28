import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto, UpdateNotificationDto, SendBulkNotificationDto, TestNotificationDto, CreateGeneralReminderDto, NotificationChannel } from './dto/notification.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto, currentUser: any) {
    // Verify user exists and current user has access
    const user = await this.prisma.user.findUnique({
      where: { id: createNotificationDto.userId },
      include: { client: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
        throw new ForbiddenException('You can only create notifications for your client users');
      }
      if (currentUser.role === 'CLIENT_USER' && user.id !== currentUser.id) {
        throw new ForbiddenException('You can only create notifications for yourself');
      }
    }

    let userSubscription: any = null;
    if (createNotificationDto.userSubscriptionId) {
      // Verify user subscription exists if provided
      userSubscription = await this.prisma.userSubscription.findUnique({
        where: { id: createNotificationDto.userSubscriptionId },
        include: {
          user: true,
          template: {
            include: { client: true },
          },
        },
      });

      if (!userSubscription) {
        throw new NotFoundException('User subscription not found');
      }

      if (userSubscription.userId !== createNotificationDto.userId) {
        throw new BadRequestException('User subscription does not belong to the specified user');
      }
    }

    // Process template variables if provided
    let processedMessage = createNotificationDto.message;
    if (createNotificationDto.templateVariables) {
      processedMessage = this.processTemplateVariables(
        createNotificationDto.message,
        createNotificationDto.templateVariables,
        userSubscription || { user },
      );
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        userSubscriptionId: createNotificationDto.userSubscriptionId,
        clientId: user.clientId || userSubscription?.template?.clientId || '',
        recipient: user.email, // Use user email directly
        channel: createNotificationDto.channel as any,
        message: processedMessage,
        subject: createNotificationDto.subject,
        status: 'PENDING' as any,
        templateVariables: createNotificationDto.templateVariables,
      },
      include: {
        userSubscription: userSubscription ? {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            template: {
              select: { id: true, title: true, client: { select: { id: true, name: true } } },
            },
          },
        } : undefined,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Send notification immediately
    await this.sendNotification(notification);

    return notification;
  }

  async createGeneralReminder(createReminderDto: any, currentUser: any) {
    // Verify user exists and current user has access
    const user = await this.prisma.user.findUnique({
      where: { id: createReminderDto.userId },
      include: { client: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
        throw new ForbiddenException('You can only send reminders to your client users');
      }
      if (currentUser.role === 'CLIENT_USER' && user.id !== currentUser.id) {
        throw new ForbiddenException('You can only send reminders to yourself');
      }
    }

    // Process template variables if provided
    let processedMessage = createReminderDto.message;
    if (createReminderDto.templateVariables) {
      processedMessage = this.processTemplateVariables(
        createReminderDto.message,
        createReminderDto.templateVariables,
        { user },
      );
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: createReminderDto.userId,
        clientId: user.clientId || '',
        recipient: createReminderDto.channel === 'WHATSAPP' ? (user.phone || user.email) : user.email,
        channel: createReminderDto.channel as any,
        message: processedMessage,
        subject: createReminderDto.subject,
        status: 'PENDING' as any,
        templateVariables: createReminderDto.templateVariables,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Send notification immediately
    await this.sendNotification(notification);

    return notification;
  }

  async findAll(currentUser: any, page = 1, limit = 10, status?: string, channel?: string) {
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    // Apply role-based filtering
    if (currentUser.role === 'CLIENT') {
      whereCondition.userSubscription = {
        template: { clientId: currentUser.clientId },
      };
    } else if (currentUser.role === 'CLIENT_USER') {
      whereCondition.userSubscription = {
        userId: currentUser.id,
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    if (channel) {
      whereCondition.channel = channel;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereCondition,
        include: {
          userSubscription: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              template: {
                select: { id: true, title: true, client: { select: { id: true, name: true } } },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where: whereCondition }),
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser: any) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        userSubscription: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            template: {
              select: { id: true, title: true, client: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && notification.userSubscription?.template?.client?.id !== currentUser.clientId) {
        throw new ForbiddenException('You can only access notifications from your organization');
      }
      if (currentUser.role === 'CLIENT_USER' && notification.userSubscription?.userId !== currentUser.id) {
        throw new ForbiddenException('You can only access your own notifications');
      }
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto, currentUser: any) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        userSubscription: {
          include: {
            template: { include: { client: true } },
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && notification.userSubscription?.template?.clientId !== currentUser.clientId) {
        throw new ForbiddenException('You can only update notifications from your organization');
      }
      if (currentUser.role === 'CLIENT_USER') {
        throw new ForbiddenException('Client users cannot update notifications');
      }
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
      include: {
        userSubscription: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
            template: {
              select: { id: true, title: true, client: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    return updatedNotification;
  }

  async remove(id: string, currentUser: any) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        userSubscription: {
          include: {
            template: { include: { client: true } },
          },
        },
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && notification.userSubscription?.template?.clientId !== currentUser.clientId) {
        throw new ForbiddenException('You can only delete notifications from your organization');
      }
      if (currentUser.role === 'CLIENT_USER') {
        throw new ForbiddenException('Client users cannot delete notifications');
      }
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted successfully' };
  }

  async sendBulk(sendBulkDto: SendBulkNotificationDto, currentUser: any) {
    // Check if this is for user subscriptions or general reminders
    if (sendBulkDto.userSubscriptionIds && sendBulkDto.userSubscriptionIds.length > 0) {
      return this.sendBulkSubscriptionNotifications(sendBulkDto, currentUser);
    } else if (sendBulkDto.userIds && sendBulkDto.userIds.length > 0) {
      return this.sendBulkGeneralReminders(sendBulkDto, currentUser);
    } else {
      throw new BadRequestException('Either userSubscriptionIds or userIds must be provided');
    }
  }

  private async sendBulkSubscriptionNotifications(sendBulkDto: SendBulkNotificationDto, currentUser: any) {
    // Verify user subscriptions exist and user has access
    const userSubscriptions = await this.prisma.userSubscription.findMany({
      where: {
        id: { in: sendBulkDto.userSubscriptionIds },
      },
      include: {
        user: true,
        template: {
          include: { client: true },
        },
      },
    });

    if (userSubscriptions.length === 0) {
      throw new NotFoundException('No valid user subscriptions found');
    }

    // Authorization check - filter subscriptions user has access to
    const authorizedSubscriptions = userSubscriptions.filter((sub) => {
      if (currentUser.role === 'SUPER_ADMIN') return true;
      if (currentUser.role === 'CLIENT' && sub.template?.clientId === currentUser.clientId) return true;
      return false;
    });

    if (authorizedSubscriptions.length === 0) {
      throw new ForbiddenException('You do not have access to any of the specified subscriptions');
    }

    const notifications: any[] = [];

    for (const subscription of authorizedSubscriptions) {
      const notification = await this.prisma.notification.create({
        data: {
          userSubscriptionId: subscription.id,
          userId: subscription.userId,
          clientId: subscription.clientId,
          templateId: subscription.templateId,
          channel: sendBulkDto.channel,
          recipient: subscription.user.email,
          subject: sendBulkDto.subject,
          message: sendBulkDto.message,
          status: 'PENDING',
        },
        include: {
          userSubscription: {
            include: {
              user: true,
              template: true,
            },
          },
        },
      });

      notifications.push(notification);

      // Send notification asynchronously
      this.sendNotification(notification);
    }

    return {
      message: `Bulk notification sent to ${notifications.length} recipients`,
      notifications: notifications.map((n) => ({ id: n.id, recipient: n.recipient })),
    };
  }

  private async sendBulkGeneralReminders(sendBulkDto: SendBulkNotificationDto, currentUser: any) {
    // Verify users exist and user has access
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: sendBulkDto.userIds },
      },
      include: {
        client: true,
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('No valid users found');
    }

    // Authorization check - filter users current user has access to
    const authorizedUsers = users.filter((user) => {
      if (currentUser.role === 'SUPER_ADMIN') return true;
      if (currentUser.role === 'CLIENT' && user.clientId === currentUser.clientId) return true;
      if (currentUser.role === 'CLIENT_USER' && user.id === currentUser.id) return true;
      return false;
    });

    if (authorizedUsers.length === 0) {
      throw new ForbiddenException('You do not have access to any of the specified users');
    }

    const notifications: any[] = [];

    for (const user of authorizedUsers) {
      // Process template variables if provided
      let processedMessage = sendBulkDto.message;
      if (sendBulkDto.templateVariables) {
        processedMessage = this.processTemplateVariables(
          sendBulkDto.message,
          sendBulkDto.templateVariables,
          { user },
        );
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId: user.id,
          clientId: user.clientId || '',
          channel: sendBulkDto.channel as any,
          recipient: sendBulkDto.channel === 'WHATSAPP' ? (user.phone || user.email) : user.email,
          subject: sendBulkDto.subject,
          message: processedMessage,
          status: 'PENDING' as any,
          templateVariables: sendBulkDto.templateVariables,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      notifications.push(notification);

      // Send notification asynchronously
      this.sendNotification(notification);
    }

    return {
      message: `Bulk reminder sent to ${notifications.length} recipients`,
      notifications: notifications.map((n) => ({ id: n.id, recipient: n.recipient })),
    };
  }

  async sendTest(testDto: TestNotificationDto, currentUser: any) {
    // Create a mock notification object for testing
    const mockNotification = {
      id: 'test',
      channel: testDto.channel,
      recipient: testDto.recipient,
      subject: testDto.subject || 'Test Email',
      message: testDto.message,
      userSubscription: {
        template: {
          client: {
            id: currentUser.clientId || 'test',
            emailConfig: null,
            whatsappConfig: null,
          },
        },
        user: {
          email: testDto.recipient,
          phone: testDto.recipient,
        },
      },
    };

    if (testDto.channel === 'EMAIL') {
      await this.sendEmail(mockNotification as any);
    } else if (testDto.channel === 'WHATSAPP') {
      await this.sendWhatsApp(mockNotification as any);
    }

    return { message: 'Test notification sent successfully' };
  }

  async sendBulkNotification(sendBulkNotificationDto: SendBulkNotificationDto, currentUser: any) {
    const userSubscriptions = await this.prisma.userSubscription.findMany({
      where: {
        id: { in: sendBulkNotificationDto.userSubscriptionIds },
      },
      include: {
        user: true,
        template: {
          include: { client: true },
        },
      },
    });

    // Authorization check - ensure all subscriptions belong to user's organization
    if (currentUser.role !== 'SUPER_ADMIN') {
      const unauthorizedSubscriptions = userSubscriptions.filter(
        (sub) => currentUser.role === 'CLIENT' && sub.template?.clientId !== currentUser.clientId,
      );

      if (unauthorizedSubscriptions.length > 0) {
        throw new ForbiddenException('You can only send notifications to your organization users');
      }
    }

    const notifications: any[] = [];

    for (const userSubscription of userSubscriptions) {
      let processedMessage = sendBulkNotificationDto.message;
      if (sendBulkNotificationDto.templateVariables) {
        processedMessage = this.processTemplateVariables(
          sendBulkNotificationDto.message,
          sendBulkNotificationDto.templateVariables,
          userSubscription,
        );
      }

      const notification = await this.prisma.notification.create({
        data: {
          userSubscriptionId: userSubscription.id,
          userId: userSubscription.userId,
          clientId: userSubscription.template?.clientId || userSubscription.clientId,
          recipient: userSubscription.user.email,
          channel: sendBulkNotificationDto.channel as any,
          message: processedMessage,
          subject: sendBulkNotificationDto.subject,
          status: 'PENDING' as any,
          templateVariables: sendBulkNotificationDto.templateVariables,
        },
        include: {
          userSubscription: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              template: {
                select: { id: true, title: true, client: { select: { id: true, name: true } } },
              },
            },
          },
        },
      });

      notifications.push(notification);

      // Send notification in background
      this.sendNotification(notification).catch(console.error);
    }

    return {
      message: `Bulk notification sent to ${notifications.length} users`,
      notifications,
    };
  }

  async testNotification(testNotificationDto: TestNotificationDto, currentUser: any) {
    // Only clients and super admins can send test notifications
    if (currentUser.role === 'CLIENT_USER') {
      throw new ForbiddenException('Client users cannot send test notifications');
    }

    try {
      if (testNotificationDto.channel === NotificationChannel.EMAIL || testNotificationDto.channel === NotificationChannel.BOTH) {
        await this.sendTestEmail(testNotificationDto.recipient, testNotificationDto.subject || 'Test Email', testNotificationDto.message);
      }

      if (testNotificationDto.channel === NotificationChannel.WHATSAPP || testNotificationDto.channel === NotificationChannel.BOTH) {
        await this.sendTestWhatsApp(testNotificationDto.recipient, testNotificationDto.message);
      }

      return { message: 'Test notification sent successfully' };
    } catch (error) {
      throw new BadRequestException(`Test notification failed: ${error.message}`);
    }
  }

  async getNotificationStats(currentUser: any, startDate?: string, endDate?: string) {
    let whereCondition: any = {};

    // Apply role-based filtering
    if (currentUser.role === 'CLIENT') {
      whereCondition.userSubscription = {
        template: { clientId: currentUser.clientId },
      };
    } else if (currentUser.role === 'CLIENT_USER') {
      whereCondition.userSubscription = {
        userId: currentUser.id,
      };
    }

    if (startDate && endDate) {
      whereCondition.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const stats = await this.prisma.$transaction([
      // Total notifications
      this.prisma.notification.count({ where: whereCondition }),
      // Sent notifications
      this.prisma.notification.count({ where: { ...whereCondition, status: 'SENT' } }),
      // Delivered notifications
      this.prisma.notification.count({ where: { ...whereCondition, status: 'DELIVERED' } }),
      // Failed notifications
      this.prisma.notification.count({ where: { ...whereCondition, status: 'FAILED' } }),
      // Email notifications
      this.prisma.notification.count({ where: { ...whereCondition, channel: 'EMAIL' } }),
      // WhatsApp notifications
      this.prisma.notification.count({ where: { ...whereCondition, channel: 'WHATSAPP' } }),
    ]);

    const [totalNotifications, sentNotifications, deliveredNotifications, failedNotifications, emailNotifications, whatsappNotifications] = stats;

    const successRate = totalNotifications > 0 ? ((sentNotifications + deliveredNotifications) / totalNotifications) * 100 : 0;

    return {
      totalNotifications,
      sentNotifications,
      deliveredNotifications,
      failedNotifications,
      pendingNotifications: totalNotifications - sentNotifications - deliveredNotifications - failedNotifications,
      emailNotifications,
      whatsappNotifications,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  private async sendNotification(notification: any) {
    try {
      if (notification.channel === 'EMAIL' || notification.channel === 'BOTH') {
        await this.sendEmail(notification);
      }

      if (notification.channel === 'WHATSAPP' || notification.channel === 'BOTH') {
        await this.sendWhatsApp(notification);
      }

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (error) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { 
          status: 'FAILED', 
          errorMessage: error.message,
          sentAt: new Date() 
        },
      });
    }
  }

  private async sendEmail(notification: any) {
    // Get client email configuration
    const client = await this.prisma.client.findUnique({
      where: { id: notification.userSubscription.template?.client?.id || notification.clientId },
      include: {
        emailConfig: true,
      },
    });

    if (!client?.emailConfig) {
      throw new Error('Email configuration not found for client');
    }

    const transporter = nodemailer.createTransport({
      host: client.emailConfig.smtpHost,
      port: client.emailConfig.smtpPort,
      secure: client.emailConfig.smtpPort === 465,
      auth: {
        user: client.emailConfig.smtpUser,
        pass: client.emailConfig.smtpPassword,
      },
    });

    await transporter.sendMail({
      from: client.emailConfig.fromEmail,
      to: notification.userSubscription.user.email,
      subject: notification.subject || 'Notification',
      text: notification.message,
      html: notification.message.replace(/\n/g, '<br>'),
    });
  }

  private async sendWhatsApp(notification: any) {
    // Get client WhatsApp configuration
    const client = await this.prisma.client.findUnique({
      where: { id: notification.userSubscription.template?.client?.id || notification.clientId },
      include: {
        whatsappConfig: true,
      },
    });

    if (!client?.whatsappConfig) {
      throw new Error('WhatsApp configuration not found for client');
    }

    // Mock WhatsApp sending - implement actual WhatsApp Business API
    console.log('Sending WhatsApp to:', notification.userSubscription.user.phone);
    console.log('Message:', notification.message);
  }

  private async sendTestEmail(recipient: string, subject: string, message: string) {
    // Use default SMTP configuration for testing
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'test@example.com',
      to: recipient,
      subject,
      text: message,
      html: message.replace(/\n/g, '<br>'),
    });
  }

  private async sendTestWhatsApp(recipient: string, message: string) {
    // Mock test WhatsApp sending
    console.log('Test WhatsApp to:', recipient);
    console.log('Message:', message);
  }

  private processTemplateVariables(
    message: string,
    variables: Record<string, any>,
    userSubscription: any,
  ): string {
    let processedMessage = message;

    // Replace user variables
    processedMessage = processedMessage.replace(/{{user_name}}/g, userSubscription.user.name || '');
    processedMessage = processedMessage.replace(/{{user_email}}/g, userSubscription.user.email || '');
    processedMessage = processedMessage.replace(/{{user_phone}}/g, userSubscription.user.phone || '');

    // Replace template variables
    processedMessage = processedMessage.replace(/{{template_title}}/g, userSubscription.template?.title || '');
    processedMessage = processedMessage.replace(/{{client_name}}/g, userSubscription.template?.client?.name || '');

    // Replace custom variables
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedMessage = processedMessage.replace(regex, variables[key] || '');
    });

    return processedMessage;
  }
}
