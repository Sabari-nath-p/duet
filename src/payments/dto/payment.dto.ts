import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'User subscription ID' })
  @IsUUID()
  userSubscriptionId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @ApiProperty({ description: 'Payment provider', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ description: 'Payment due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Payment description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiProperty({ description: 'Payment status', enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ description: 'External payment ID from provider', required: false })
  @IsString()
  @IsOptional()
  externalPaymentId?: string;

  @ApiProperty({ description: 'Payment gateway response', required: false })
  @IsOptional()
  gatewayResponse?: any;
}

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Webhook event type' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'Payment provider', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ApiProperty({ description: 'Webhook payload' })
  payload: any;

  @ApiProperty({ description: 'Webhook signature for verification' })
  @IsString()
  signature: string;
}

export class CreatePaymentLinkDto {
  @ApiProperty({ description: 'User subscription ID' })
  @IsUUID()
  userSubscriptionId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ description: 'Payment description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Payment due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Customer email', required: false })
  @IsString()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ description: 'Customer phone', required: false })
  @IsString()
  @IsOptional()
  customerPhone?: string;
}
