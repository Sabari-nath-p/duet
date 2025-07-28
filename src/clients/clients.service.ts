import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateClientDto,
  UpdateClientDto,
  WhatsappConfigDto,
  EmailConfigDto,
  PaymentConfigDto,
} from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto, currentUserId: string) {
    // Check if client already exists
    const existingClient = await this.prisma.client.findUnique({
      where: { email: createClientDto.email },
    });

    if (existingClient) {
      throw new ConflictException('Client with this email already exists');
    }

    const client = await this.prisma.client.create({
      data: {
        name: createClientDto.name,
        email: createClientDto.email,
        phone: createClientDto.phone,
        description: createClientDto.description,
        isActive: createClientDto.isActive ?? true,
        createdById: currentUserId,
      },
      include: {
        createdBy: true,
        whatsappConfig: true,
        emailConfig: true,
        paymentConfigs: true,
      },
    });

    return client;
  }

  async findAll(currentUser: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    // Super admins can see all clients, others can only see their own
    if (currentUser.role !== 'SUPER_ADMIN') {
      whereCondition.id = currentUser.clientId;
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where: whereCondition,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: {
              users: true,
              templates: true,
              payments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.client.count({ where: whereCondition }),
    ]);

    return {
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser: any) {
    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== id) {
      throw new ForbiddenException('You can only access your own client information');
    }

    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        whatsappConfig: true,
        emailConfig: true,
        paymentConfigs: true,
        customFieldDefs: true,
        _count: {
          select: {
            users: true,
            templates: true,
            payments: true,
            userSubscriptions: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, currentUser: any) {
    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== id) {
      throw new ForbiddenException('You can only update your own client information');
    }

    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      throw new NotFoundException('Client not found');
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        whatsappConfig: true,
        emailConfig: true,
        paymentConfigs: true,
      },
    });

    return updatedClient;
  }

  async remove(id: string, currentUser: any) {
    // Only super admins can delete clients
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admins can delete clients');
    }

    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.prisma.client.delete({
      where: { id },
    });

    return { message: 'Client deleted successfully' };
  }

  async updateWhatsappConfig(clientId: string, config: WhatsappConfigDto, currentUser: any) {
    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== clientId) {
      throw new ForbiddenException('You can only update your own WhatsApp configuration');
    }

    const whatsappConfig = await this.prisma.whatsappConfig.upsert({
      where: { clientId },
      update: {
        businessApiKey: config.businessApiKey,
        phoneNumberId: config.phoneNumberId,
        accessToken: config.accessToken,
        webhookSecret: config.webhookSecret,
      },
      create: {
        clientId,
        businessApiKey: config.businessApiKey,
        phoneNumberId: config.phoneNumberId,
        accessToken: config.accessToken,
        webhookSecret: config.webhookSecret,
      },
    });

    return whatsappConfig;
  }

  async updateEmailConfig(clientId: string, config: EmailConfigDto, currentUser: any) {
    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== clientId) {
      throw new ForbiddenException('You can only update your own email configuration');
    }

    const emailConfig = await this.prisma.emailConfig.upsert({
      where: { clientId },
      update: {
        smtpHost: config.smtpHost,
        smtpPort: parseInt(config.smtpPort),
        smtpUser: config.smtpUser,
        smtpPassword: config.smtpPassword,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
      },
      create: {
        clientId,
        smtpHost: config.smtpHost,
        smtpPort: parseInt(config.smtpPort),
        smtpUser: config.smtpUser,
        smtpPassword: config.smtpPassword,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
      },
    });

    return emailConfig;
  }

  async updatePaymentConfig(clientId: string, config: PaymentConfigDto, currentUser: any) {
    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== clientId) {
      throw new ForbiddenException('You can only update your own payment configuration');
    }

    const paymentConfig = await this.prisma.paymentConfig.upsert({
      where: {
        clientId_provider: {
          clientId,
          provider: config.provider,
        },
      },
      update: {
        publicKey: config.publicKey,
        secretKey: config.secretKey,
        webhookSecret: config.webhookSecret,
      },
      create: {
        clientId,
        provider: config.provider,
        publicKey: config.publicKey,
        secretKey: config.secretKey,
        webhookSecret: config.webhookSecret,
      },
    });

    return paymentConfig;
  }

  async getConfigurations(clientId: string, currentUser: any) {
    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.clientId !== clientId) {
      throw new ForbiddenException('You can only access your own configurations');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        whatsappConfig: true,
        emailConfig: true,
        paymentConfigs: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return {
      whatsappConfig: client.whatsappConfig,
      emailConfig: client.emailConfig,
      paymentConfigs: client.paymentConfigs,
    };
  }
}
