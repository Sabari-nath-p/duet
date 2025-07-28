import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto, CreatePaymentLinkDto, PaymentWebhookDto, PaymentProvider } from './dto/payment.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, currentUser: any) {
    // Verify user subscription exists and user has access
    const userSubscription = await this.prisma.userSubscription.findUnique({
      where: { id: createPaymentDto.userSubscriptionId },
      include: {
        user: true,
        template: {
          include: { 
            client: {
              include: { paymentConfigs: true }
            }
          },
        },
      },
    });

    if (!userSubscription) {
      throw new NotFoundException('User subscription not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && userSubscription.template?.clientId !== currentUser.clientId) {
        throw new ForbiddenException('You can only create payments for your client users');
      }
      if (currentUser.role === 'CLIENT_USER' && userSubscription.userId !== currentUser.id) {
        throw new ForbiddenException('You can only create payments for yourself');
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        userSubscriptionId: createPaymentDto.userSubscriptionId,
        userId: userSubscription.userId,
        clientId: userSubscription.template?.clientId || userSubscription.clientId,
        paymentConfigId: userSubscription.template?.client?.paymentConfigs?.[0]?.id || '', // Will need to handle this properly
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'INR',
        provider: createPaymentDto.provider as any,
        dueDate: new Date(createPaymentDto.dueDate),
        description: createPaymentDto.description,
        status: 'PENDING' as any,
        paymentLink: this.generateUniquePaymentLink(),
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

    return payment;
  }

  async findAll(currentUser: any, page = 1, limit = 10, status?: string) {
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

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
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
      this.prisma.payment.count({ where: whereCondition }),
    ]);

    return {
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser: any) {
    const payment = await this.prisma.payment.findUnique({
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

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && payment.userSubscription.template?.client?.id !== currentUser.clientId) {
        throw new ForbiddenException('You can only access payments from your organization');
      }
      if (currentUser.role === 'CLIENT_USER' && payment.userSubscription.userId !== currentUser.id) {
        throw new ForbiddenException('You can only access your own payments');
      }
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, currentUser: any) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        userSubscription: {
          include: {
            template: { include: { client: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && payment.userSubscription.template?.clientId !== currentUser.clientId) {
        throw new ForbiddenException('You can only update payments from your organization');
      }
      if (currentUser.role === 'CLIENT_USER') {
        throw new ForbiddenException('Client users cannot update payments');
      }
    }

    const { userSubscriptionId, ...updateData } = updatePaymentDto;
    
    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: updateData,
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

    return updatedPayment;
  }

  async remove(id: string, currentUser: any) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        userSubscription: {
          include: {
            template: { include: { client: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Authorization check
    if (currentUser.role !== 'SUPER_ADMIN') {
      if (currentUser.role === 'CLIENT' && payment.userSubscription.template?.clientId !== currentUser.clientId) {
        throw new ForbiddenException('You can only delete payments from your organization');
      }
      if (currentUser.role === 'CLIENT_USER') {
        throw new ForbiddenException('Client users cannot delete payments');
      }
    }

    // Only allow deletion of pending payments
    if (payment.status !== 'PENDING') {
      throw new BadRequestException('Only pending payments can be deleted');
    }

    await this.prisma.payment.delete({
      where: { id },
    });

    return { message: 'Payment deleted successfully' };
  }

  async createPaymentLink(createPaymentLinkDto: CreatePaymentLinkDto, currentUser: any) {
    // Create payment first
    const payment = await this.create(
      {
        userSubscriptionId: createPaymentLinkDto.userSubscriptionId,
        amount: createPaymentLinkDto.amount,
        dueDate: createPaymentLinkDto.dueDate,
        description: createPaymentLinkDto.description,
        provider: PaymentProvider.RAZORPAY, // Default provider
      },
      currentUser,
    );

    // Generate payment link based on provider
    const paymentLink = await this.generatePaymentGatewayLink(payment, createPaymentLinkDto);

    // Update payment with gateway details
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        externalPaymentId: paymentLink.id,
        gatewayResponse: paymentLink,
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

    return {
      payment: updatedPayment,
      paymentUrl: paymentLink.short_url,
    };
  }

  async handleWebhook(webhookDto: PaymentWebhookDto) {
    // Verify webhook signature
    const isValid = await this.verifyWebhookSignature(webhookDto);
    
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process webhook based on provider
    if (webhookDto.provider === 'RAZORPAY') {
      return this.handleRazorpayWebhook(webhookDto);
    } else if (webhookDto.provider === 'STRIPE') {
      return this.handleStripeWebhook(webhookDto);
    }

    throw new BadRequestException('Unsupported payment provider');
  }

  async getPaymentStats(currentUser: any, startDate?: string, endDate?: string) {
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
      // Total payments
      this.prisma.payment.count({ where: whereCondition }),
      // Successful payments
      this.prisma.payment.count({ where: { ...whereCondition, status: 'COMPLETED' } }),
      // Pending payments
      this.prisma.payment.count({ where: { ...whereCondition, status: 'PENDING' } }),
      // Failed payments
      this.prisma.payment.count({ where: { ...whereCondition, status: 'FAILED' } }),
      // Total revenue
      this.prisma.payment.aggregate({
        where: { ...whereCondition, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      // Average payment amount
      this.prisma.payment.aggregate({
        where: whereCondition,
        _avg: { amount: true },
      }),
    ]);

    const [totalPayments, successfulPayments, pendingPayments, failedPayments, revenue, avgAmount] = stats;

    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    return {
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalRevenue: revenue._sum.amount || 0,
      averagePaymentAmount: avgAmount._avg.amount || 0,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  private generateUniquePaymentLink(): string {
    return `pay_${crypto.randomBytes(16).toString('hex')}`;
  }

  private async generatePaymentGatewayLink(payment: any, linkDto: CreatePaymentLinkDto) {
    // This is a mock implementation
    // In production, integrate with actual payment gateways
    return {
      id: `link_${crypto.randomBytes(16).toString('hex')}`,
      short_url: `https://rzp.io/l/${crypto.randomBytes(8).toString('hex')}`,
      amount: payment.amount * 100, // Convert to paise for Razorpay
      currency: payment.currency,
      description: payment.description,
    };
  }

  private async verifyWebhookSignature(webhookDto: PaymentWebhookDto): Promise<boolean> {
    // Mock verification - implement actual signature verification
    return true;
  }

  private async handleRazorpayWebhook(webhookDto: PaymentWebhookDto) {
    // Handle Razorpay webhook events
    const { event, payload } = webhookDto;

    if (event === 'payment.captured') {
      await this.updatePaymentStatus(payload.payment_link.id, 'COMPLETED', payload);
    } else if (event === 'payment.failed') {
      await this.updatePaymentStatus(payload.payment_link.id, 'FAILED', payload);
    }

    return { status: 'processed' };
  }

  private async handleStripeWebhook(webhookDto: PaymentWebhookDto) {
    // Handle Stripe webhook events
    const { event, payload } = webhookDto;

    if (event === 'checkout.session.completed') {
      await this.updatePaymentStatus(payload.id, 'COMPLETED', payload);
    } else if (event === 'checkout.session.expired') {
      await this.updatePaymentStatus(payload.id, 'FAILED', payload);
    }

    return { status: 'processed' };
  }

  private async updatePaymentStatus(externalPaymentId: string, status: string, gatewayResponse: any) {
    await this.prisma.payment.updateMany({
      where: { externalPaymentId },
      data: {
        status: status as any,
        gatewayResponse,
        updatedAt: new Date(),
      },
    });
  }
}
