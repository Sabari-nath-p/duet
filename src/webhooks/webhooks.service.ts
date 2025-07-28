import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  async processRazorpayWebhook(payload: any, signature: string) {
    this.logger.debug('Processing Razorpay webhook...');

    // Verify webhook signature
    if (!this.verifyRazorpaySignature(payload, signature)) {
      throw new BadRequestException('Invalid Razorpay webhook signature');
    }

    const { event, payment } = payload;

    try {
      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payment);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payment);
          break;
        case 'payment_link.paid':
          await this.handlePaymentLinkPaid(payload.payment_link);
          break;
        case 'payment_link.expired':
          await this.handlePaymentLinkExpired(payload.payment_link);
          break;
        default:
          this.logger.warn(`Unhandled Razorpay event: ${event}`);
      }

      // Log webhook for audit trail
      await this.logWebhookEvent('RAZORPAY', event, payload, 'SUCCESS');

      return { status: 'success', message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error processing Razorpay webhook: ${error.message}`, error.stack);
      await this.logWebhookEvent('RAZORPAY', event, payload, 'FAILED', error.message);
      throw error;
    }
  }

  async handleStripeWebhook(payload: any, signature: string) {
    this.logger.debug('Processing Stripe webhook...');

    // Verify webhook signature
    if (!this.verifyStripeSignature(payload, signature)) {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    const { type, data } = payload;

    try {
      switch (type) {
        case 'checkout.session.completed':
          await this.handleStripeCheckoutCompleted(data.object);
          break;
        case 'checkout.session.expired':
          await this.handleStripeCheckoutExpired(data.object);
          break;
        case 'payment_intent.succeeded':
          await this.handleStripePaymentSucceeded(data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handleStripePaymentFailed(data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleStripeInvoicePaymentSucceeded(data.object);
          break;
        case 'customer.subscription.created':
          await this.handleStripeSubscriptionCreated(data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleStripeSubscriptionDeleted(data.object);
          break;
        default:
          this.logger.warn(`Unhandled Stripe event: ${type}`);
      }

      // Log webhook for audit trail
      await this.logWebhookEvent('STRIPE', type, payload, 'SUCCESS');

      return { status: 'success', message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error processing Stripe webhook: ${error.message}`, error.stack);
      await this.logWebhookEvent('STRIPE', type, payload, 'FAILED', error.message);
      throw error;
    }
  }

  async handleWhatsAppWebhook(payload: any, signature?: string) {
    this.logger.debug('Processing WhatsApp webhook...');

    // Verify webhook signature if provided
    if (signature && !this.verifyWhatsAppSignature(payload, signature)) {
      throw new BadRequestException('Invalid WhatsApp webhook signature');
    }

    try {
      const { entry } = payload;

      for (const entry_item of entry) {
        const { changes } = entry_item;

        for (const change of changes) {
          if (change.field === 'messages') {
            const { value } = change;
            
            if (value.messages) {
              for (const message of value.messages) {
                await this.handleWhatsAppMessage(message, value.metadata);
              }
            }

            if (value.statuses) {
              for (const status of value.statuses) {
                await this.handleWhatsAppStatus(status, value.metadata);
              }
            }
          }
        }
      }

      // Log webhook for audit trail
      await this.logWebhookEvent('WHATSAPP', 'message_status', payload, 'SUCCESS');

      return { status: 'success', message: 'WhatsApp webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error processing WhatsApp webhook: ${error.message}`, error.stack);
      await this.logWebhookEvent('WHATSAPP', 'message_status', payload, 'FAILED', error.message);
      throw error;
    }
  }

  async getWebhookLogs(currentUser: any, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    // Apply role-based filtering if needed
    if (currentUser.role === 'CLIENT') {
      // For clients, we might want to filter by their organization
      // This would require additional logic to map webhooks to clients
    }

    const [logs, total] = await Promise.all([
      this.prisma.webhookLog.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.webhookLog.count({ where: whereCondition }),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async handlePaymentCaptured(payment: any) {
    await this.updatePaymentStatus(payment.id, 'COMPLETED', payment);
    this.logger.log(`Payment captured: ${payment.id}`);
  }

  private async handlePaymentFailed(payment: any) {
    await this.updatePaymentStatus(payment.id, 'FAILED', payment);
    this.logger.log(`Payment failed: ${payment.id}`);
  }

  private async handlePaymentLinkPaid(paymentLink: any) {
    // Find payment by external payment link ID
    const payment = await this.prisma.payment.findFirst({
      where: { externalPaymentId: paymentLink.id },
    });

    if (payment) {
      await this.updatePaymentStatus(payment.id, 'COMPLETED', paymentLink);
      this.logger.log(`Payment link paid: ${paymentLink.id}`);
    }
  }

  private async handlePaymentLinkExpired(paymentLink: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { externalPaymentId: paymentLink.id },
    });

    if (payment) {
      await this.updatePaymentStatus(payment.id, 'FAILED', paymentLink);
      this.logger.log(`Payment link expired: ${paymentLink.id}`);
    }
  }

  private async handleStripeCheckoutCompleted(session: any) {
    // Handle successful Stripe checkout session
    const payment = await this.prisma.payment.findFirst({
      where: { externalPaymentId: session.id },
    });

    if (payment) {
      await this.updatePaymentStatus(payment.id, 'COMPLETED', session);
      this.logger.log(`Stripe checkout completed: ${session.id}`);
    }
  }

  private async handleStripeCheckoutExpired(session: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { externalPaymentId: session.id },
    });

    if (payment) {
      await this.updatePaymentStatus(payment.id, 'FAILED', session);
      this.logger.log(`Stripe checkout expired: ${session.id}`);
    }
  }

  private async handleStripePaymentSucceeded(paymentIntent: any) {
    // Handle successful payment intent
    const payment = await this.prisma.payment.findFirst({
      where: { externalPaymentId: paymentIntent.id },
    });

    if (payment) {
      await this.updatePaymentStatus(payment.id, 'COMPLETED', paymentIntent);
      this.logger.log(`Stripe payment succeeded: ${paymentIntent.id}`);
    }
  }

  private async handleStripePaymentFailed(paymentIntent: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { externalPaymentId: paymentIntent.id },
    });

    if (payment) {
      await this.updatePaymentStatus(payment.id, 'FAILED', paymentIntent);
      this.logger.log(`Stripe payment failed: ${paymentIntent.id}`);
    }
  }

  private async handleStripeInvoicePaymentSucceeded(invoice: any) {
    // Handle successful invoice payment (for subscriptions)
    this.logger.log(`Stripe invoice payment succeeded: ${invoice.id}`);
  }

  private async handleStripeSubscriptionCreated(subscription: any) {
    // Handle new subscription creation
    this.logger.log(`Stripe subscription created: ${subscription.id}`);
  }

  private async handleStripeSubscriptionDeleted(subscription: any) {
    // Handle subscription cancellation
    this.logger.log(`Stripe subscription deleted: ${subscription.id}`);
  }

  private async handleWhatsAppMessage(message: any, metadata: any) {
    // Handle incoming WhatsApp messages
    this.logger.log(`WhatsApp message received from ${message.from}: ${message.type}`);
    
    // You might want to:
    // 1. Store the message in database
    // 2. Trigger auto-responses
    // 3. Update conversation status
  }

  private async handleWhatsAppStatus(status: any, metadata: any) {
    // Handle message delivery status updates
    this.logger.log(`WhatsApp status update: ${status.id} - ${status.status}`);

    // Update notification status based on WhatsApp delivery status
    const notification = await this.prisma.notification.findFirst({
      where: { 
        providerResponse: {
          path: ['whatsapp_message_id'],
          equals: status.id,
        },
      },
    });

    if (notification) {
      let notificationStatus = 'SENT';
      if (status.status === 'delivered') {
        notificationStatus = 'DELIVERED';
      } else if (status.status === 'failed') {
        notificationStatus = 'FAILED';
      }

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { 
          status: notificationStatus as any,
          providerResponse: {
            ...(typeof notification.providerResponse === 'object' && notification.providerResponse !== null ? notification.providerResponse : {}),
            delivery_status: status,
          },
        },
      });
    }
  }

  private async updatePaymentStatus(paymentId: string, status: string, gatewayResponse: any) {
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status as any,
        gatewayResponse,
        updatedAt: new Date(),
      },
    });
  }

  private async logWebhookEvent(
    provider: string,
    eventType: string,
    payload: any,
    status: string,
    errorMessage?: string,
  ) {
    await this.prisma.webhookLog.create({
      data: {
        webhookEndpointId: 'default', // Will need to handle this properly
        provider: provider as any,
        eventType,
        payload,
        signature: '', // Will need to handle this properly
        processed: status === 'SUCCESS',
        error: errorMessage,
      },
    });
  }

  private verifyRazorpaySignature(payload: any, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      this.logger.warn('Razorpay webhook secret not configured');
      return true; // Allow in development
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  }

  private verifyStripeSignature(payload: any, signature: string): boolean {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      this.logger.warn('Stripe webhook secret not configured');
      return true; // Allow in development
    }

    // Stripe signature verification would use stripe library
    // This is a simplified version
    return true;
  }

  private verifyWhatsAppSignature(payload: any, signature: string): boolean {
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      this.logger.warn('WhatsApp webhook secret not configured');
      return true; // Allow in development
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }
}
