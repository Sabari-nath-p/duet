import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RecurringInterval {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
}

export enum NotificationChannel {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  BOTH = 'BOTH',
}

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
}

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Template body/message content' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Recurring payment value' })
  @IsNumber()
  @Min(1)
  recurringValue: number;

  @ApiProperty({ description: 'Recurring payment interval', enum: RecurringInterval })
  @IsEnum(RecurringInterval)
  recurringInterval: RecurringInterval;

  @ApiProperty({ description: 'Notification channel', enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  notificationChannel: NotificationChannel;

  @ApiProperty({ description: 'Payment provider', enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;

  @ApiProperty({ description: 'Whether template is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Payment Reminder Options
  @ApiProperty({ description: 'Enable payment reminders', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  enablePaymentReminders?: boolean;

  @ApiProperty({ description: 'Include payment links in reminders', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  includePaymentLink?: boolean;

  @ApiProperty({ description: 'Days before due date to send reminders', required: false, default: [7, 3, 1] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  reminderDaysBefore?: number[];

  @ApiProperty({ description: 'Enable overdue payment reminders', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  enableOverdueReminders?: boolean;

  @ApiProperty({ description: 'Days after due date to send overdue reminders', required: false, default: [1, 3, 7] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  overdueReminderDays?: number[];
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  recurringValue?: number;

  @IsOptional()
  @IsEnum(RecurringInterval)
  recurringInterval?: RecurringInterval;

  @IsOptional()
  @IsEnum(NotificationChannel)
  notificationChannel?: NotificationChannel;

  @IsOptional()
  @IsEnum(PaymentProvider)
  paymentProvider?: PaymentProvider;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
