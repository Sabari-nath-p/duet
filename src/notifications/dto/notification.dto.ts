import { IsOptional, IsString, IsEnum, IsUUID, IsObject, IsArray } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

// Define enums locally to match Prisma schema
export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  BOTH = 'BOTH',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID for the notification' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'User subscription ID (optional for general reminders)', required: false })
  @IsUUID()
  @IsOptional()
  userSubscriptionId?: string;

  @ApiProperty({ description: 'Notification channel', enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Subject for email notifications', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Template variables', required: false })
  @IsObject()
  @IsOptional()
  templateVariables?: Record<string, any>;
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({ description: 'Notification status', enum: NotificationStatus, required: false })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @ApiProperty({ description: 'Provider response', required: false })
  @IsObject()
  @IsOptional()
  providerResponse?: any;

  @ApiProperty({ description: 'Error message if failed', required: false })
  @IsString()
  @IsOptional()
  errorMessage?: string;
}

export class SendBulkNotificationDto {
  @ApiProperty({ description: 'Array of user IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiProperty({ description: 'Array of user subscription IDs (optional for general reminders)', required: false })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  userSubscriptionIds?: string[];

  @ApiProperty({ description: 'Notification channel', enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Subject for email notifications', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Template variables', required: false })
  @IsObject()
  @IsOptional()
  templateVariables?: Record<string, any>;
}

export class TestNotificationDto {
  @ApiProperty({ description: 'Test recipient email or phone' })
  @IsString()
  recipient: string;

  @ApiProperty({ description: 'Notification channel', enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: 'Test message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Subject for email test', required: false })
  @IsString()
  @IsOptional()
  subject?: string;
}

export class CreateGeneralReminderDto {
  @ApiProperty({ description: 'User ID for the reminder' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Notification channel', enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: 'Reminder message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Subject for email reminders', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Template variables for personalization', required: false })
  @IsObject()
  @IsOptional()
  templateVariables?: Record<string, any>;
}
