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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notification_dto_1 = require("./dto/notification.dto");
const nodemailer = require("nodemailer");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createNotificationDto, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id: createNotificationDto.userId },
            include: { client: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only create notifications for your client users');
            }
            if (currentUser.role === 'CLIENT_USER' && user.id !== currentUser.id) {
                throw new common_1.ForbiddenException('You can only create notifications for yourself');
            }
        }
        let userSubscription = null;
        if (createNotificationDto.userSubscriptionId) {
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
                throw new common_1.NotFoundException('User subscription not found');
            }
            if (userSubscription.userId !== createNotificationDto.userId) {
                throw new common_1.BadRequestException('User subscription does not belong to the specified user');
            }
        }
        let processedMessage = createNotificationDto.message;
        if (createNotificationDto.templateVariables) {
            processedMessage = this.processTemplateVariables(createNotificationDto.message, createNotificationDto.templateVariables, userSubscription || { user });
        }
        const notification = await this.prisma.notification.create({
            data: {
                userId: createNotificationDto.userId,
                userSubscriptionId: createNotificationDto.userSubscriptionId,
                clientId: user.clientId || userSubscription?.template?.clientId || '',
                recipient: user.email,
                channel: createNotificationDto.channel,
                message: processedMessage,
                subject: createNotificationDto.subject,
                status: 'PENDING',
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
        await this.sendNotification(notification);
        return notification;
    }
    async createGeneralReminder(createReminderDto, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { id: createReminderDto.userId },
            include: { client: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && user.clientId !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only send reminders to your client users');
            }
            if (currentUser.role === 'CLIENT_USER' && user.id !== currentUser.id) {
                throw new common_1.ForbiddenException('You can only send reminders to yourself');
            }
        }
        let processedMessage = createReminderDto.message;
        if (createReminderDto.templateVariables) {
            processedMessage = this.processTemplateVariables(createReminderDto.message, createReminderDto.templateVariables, { user });
        }
        const notification = await this.prisma.notification.create({
            data: {
                userId: createReminderDto.userId,
                clientId: user.clientId || '',
                recipient: createReminderDto.channel === 'WHATSAPP' ? (user.phone || user.email) : user.email,
                channel: createReminderDto.channel,
                message: processedMessage,
                subject: createReminderDto.subject,
                status: 'PENDING',
                templateVariables: createReminderDto.templateVariables,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        });
        await this.sendNotification(notification);
        return notification;
    }
    async findAll(currentUser, page = 1, limit = 10, status, channel) {
        const skip = (page - 1) * limit;
        let whereCondition = {};
        if (currentUser.role === 'CLIENT') {
            whereCondition.userSubscription = {
                template: { clientId: currentUser.clientId },
            };
        }
        else if (currentUser.role === 'CLIENT_USER') {
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
    async findOne(id, currentUser) {
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
            throw new common_1.NotFoundException('Notification not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && notification.userSubscription?.template?.client?.id !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only access notifications from your organization');
            }
            if (currentUser.role === 'CLIENT_USER' && notification.userSubscription?.userId !== currentUser.id) {
                throw new common_1.ForbiddenException('You can only access your own notifications');
            }
        }
        return notification;
    }
    async update(id, updateNotificationDto, currentUser) {
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
            throw new common_1.NotFoundException('Notification not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && notification.userSubscription?.template?.clientId !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only update notifications from your organization');
            }
            if (currentUser.role === 'CLIENT_USER') {
                throw new common_1.ForbiddenException('Client users cannot update notifications');
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
    async remove(id, currentUser) {
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
            throw new common_1.NotFoundException('Notification not found');
        }
        if (currentUser.role !== 'SUPER_ADMIN') {
            if (currentUser.role === 'CLIENT' && notification.userSubscription?.template?.clientId !== currentUser.clientId) {
                throw new common_1.ForbiddenException('You can only delete notifications from your organization');
            }
            if (currentUser.role === 'CLIENT_USER') {
                throw new common_1.ForbiddenException('Client users cannot delete notifications');
            }
        }
        await this.prisma.notification.delete({
            where: { id },
        });
        return { message: 'Notification deleted successfully' };
    }
    async sendBulk(sendBulkDto, currentUser) {
        if (sendBulkDto.userSubscriptionIds && sendBulkDto.userSubscriptionIds.length > 0) {
            return this.sendBulkSubscriptionNotifications(sendBulkDto, currentUser);
        }
        else if (sendBulkDto.userIds && sendBulkDto.userIds.length > 0) {
            return this.sendBulkGeneralReminders(sendBulkDto, currentUser);
        }
        else {
            throw new common_1.BadRequestException('Either userSubscriptionIds or userIds must be provided');
        }
    }
    async sendBulkSubscriptionNotifications(sendBulkDto, currentUser) {
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
            throw new common_1.NotFoundException('No valid user subscriptions found');
        }
        const authorizedSubscriptions = userSubscriptions.filter((sub) => {
            if (currentUser.role === 'SUPER_ADMIN')
                return true;
            if (currentUser.role === 'CLIENT' && sub.template?.clientId === currentUser.clientId)
                return true;
            return false;
        });
        if (authorizedSubscriptions.length === 0) {
            throw new common_1.ForbiddenException('You do not have access to any of the specified subscriptions');
        }
        const notifications = [];
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
            this.sendNotification(notification);
        }
        return {
            message: `Bulk notification sent to ${notifications.length} recipients`,
            notifications: notifications.map((n) => ({ id: n.id, recipient: n.recipient })),
        };
    }
    async sendBulkGeneralReminders(sendBulkDto, currentUser) {
        const users = await this.prisma.user.findMany({
            where: {
                id: { in: sendBulkDto.userIds },
            },
            include: {
                client: true,
            },
        });
        if (users.length === 0) {
            throw new common_1.NotFoundException('No valid users found');
        }
        const authorizedUsers = users.filter((user) => {
            if (currentUser.role === 'SUPER_ADMIN')
                return true;
            if (currentUser.role === 'CLIENT' && user.clientId === currentUser.clientId)
                return true;
            if (currentUser.role === 'CLIENT_USER' && user.id === currentUser.id)
                return true;
            return false;
        });
        if (authorizedUsers.length === 0) {
            throw new common_1.ForbiddenException('You do not have access to any of the specified users');
        }
        const notifications = [];
        for (const user of authorizedUsers) {
            let processedMessage = sendBulkDto.message;
            if (sendBulkDto.templateVariables) {
                processedMessage = this.processTemplateVariables(sendBulkDto.message, sendBulkDto.templateVariables, { user });
            }
            const notification = await this.prisma.notification.create({
                data: {
                    userId: user.id,
                    clientId: user.clientId || '',
                    channel: sendBulkDto.channel,
                    recipient: sendBulkDto.channel === 'WHATSAPP' ? (user.phone || user.email) : user.email,
                    subject: sendBulkDto.subject,
                    message: processedMessage,
                    status: 'PENDING',
                    templateVariables: sendBulkDto.templateVariables,
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, phone: true },
                    },
                },
            });
            notifications.push(notification);
            this.sendNotification(notification);
        }
        return {
            message: `Bulk reminder sent to ${notifications.length} recipients`,
            notifications: notifications.map((n) => ({ id: n.id, recipient: n.recipient })),
        };
    }
    async sendTest(testDto, currentUser) {
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
            await this.sendEmail(mockNotification);
        }
        else if (testDto.channel === 'WHATSAPP') {
            await this.sendWhatsApp(mockNotification);
        }
        return { message: 'Test notification sent successfully' };
    }
    async sendBulkNotification(sendBulkNotificationDto, currentUser) {
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
        if (currentUser.role !== 'SUPER_ADMIN') {
            const unauthorizedSubscriptions = userSubscriptions.filter((sub) => currentUser.role === 'CLIENT' && sub.template?.clientId !== currentUser.clientId);
            if (unauthorizedSubscriptions.length > 0) {
                throw new common_1.ForbiddenException('You can only send notifications to your organization users');
            }
        }
        const notifications = [];
        for (const userSubscription of userSubscriptions) {
            let processedMessage = sendBulkNotificationDto.message;
            if (sendBulkNotificationDto.templateVariables) {
                processedMessage = this.processTemplateVariables(sendBulkNotificationDto.message, sendBulkNotificationDto.templateVariables, userSubscription);
            }
            const notification = await this.prisma.notification.create({
                data: {
                    userSubscriptionId: userSubscription.id,
                    userId: userSubscription.userId,
                    clientId: userSubscription.template?.clientId || userSubscription.clientId,
                    recipient: userSubscription.user.email,
                    channel: sendBulkNotificationDto.channel,
                    message: processedMessage,
                    subject: sendBulkNotificationDto.subject,
                    status: 'PENDING',
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
            this.sendNotification(notification).catch(console.error);
        }
        return {
            message: `Bulk notification sent to ${notifications.length} users`,
            notifications,
        };
    }
    async testNotification(testNotificationDto, currentUser) {
        if (currentUser.role === 'CLIENT_USER') {
            throw new common_1.ForbiddenException('Client users cannot send test notifications');
        }
        try {
            if (testNotificationDto.channel === notification_dto_1.NotificationChannel.EMAIL || testNotificationDto.channel === notification_dto_1.NotificationChannel.BOTH) {
                await this.sendTestEmail(testNotificationDto.recipient, testNotificationDto.subject || 'Test Email', testNotificationDto.message);
            }
            if (testNotificationDto.channel === notification_dto_1.NotificationChannel.WHATSAPP || testNotificationDto.channel === notification_dto_1.NotificationChannel.BOTH) {
                await this.sendTestWhatsApp(testNotificationDto.recipient, testNotificationDto.message);
            }
            return { message: 'Test notification sent successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Test notification failed: ${error.message}`);
        }
    }
    async getNotificationStats(currentUser, startDate, endDate) {
        let whereCondition = {};
        if (currentUser.role === 'CLIENT') {
            whereCondition.userSubscription = {
                template: { clientId: currentUser.clientId },
            };
        }
        else if (currentUser.role === 'CLIENT_USER') {
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
            this.prisma.notification.count({ where: whereCondition }),
            this.prisma.notification.count({ where: { ...whereCondition, status: 'SENT' } }),
            this.prisma.notification.count({ where: { ...whereCondition, status: 'DELIVERED' } }),
            this.prisma.notification.count({ where: { ...whereCondition, status: 'FAILED' } }),
            this.prisma.notification.count({ where: { ...whereCondition, channel: 'EMAIL' } }),
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
    async sendNotification(notification) {
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
        }
        catch (error) {
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
    async sendEmail(notification) {
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
    async sendWhatsApp(notification) {
        const client = await this.prisma.client.findUnique({
            where: { id: notification.userSubscription.template?.client?.id || notification.clientId },
            include: {
                whatsappConfig: true,
            },
        });
        if (!client?.whatsappConfig) {
            throw new Error('WhatsApp configuration not found for client');
        }
        console.log('Sending WhatsApp to:', notification.userSubscription.user.phone);
        console.log('Message:', notification.message);
    }
    async sendTestEmail(recipient, subject, message) {
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
    async sendTestWhatsApp(recipient, message) {
        console.log('Test WhatsApp to:', recipient);
        console.log('Message:', message);
    }
    processTemplateVariables(message, variables, userSubscription) {
        let processedMessage = message;
        processedMessage = processedMessage.replace(/{{user_name}}/g, userSubscription.user.name || '');
        processedMessage = processedMessage.replace(/{{user_email}}/g, userSubscription.user.email || '');
        processedMessage = processedMessage.replace(/{{user_phone}}/g, userSubscription.user.phone || '');
        processedMessage = processedMessage.replace(/{{template_title}}/g, userSubscription.template?.title || '');
        processedMessage = processedMessage.replace(/{{client_name}}/g, userSubscription.template?.client?.name || '');
        Object.keys(variables).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processedMessage = processedMessage.replace(regex, variables[key] || '');
        });
        return processedMessage;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map