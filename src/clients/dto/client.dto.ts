import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class WhatsappConfigDto {
  @IsString()
  businessApiKey: string;

  @IsString()
  phoneNumberId: string;

  @IsString()
  accessToken: string;

  @IsOptional()
  @IsString()
  webhookSecret?: string;
}

export class EmailConfigDto {
  @IsString()
  smtpHost: string;

  @IsString()
  smtpPort: string;

  @IsString()
  smtpUser: string;

  @IsString()
  smtpPassword: string;

  @IsEmail()
  fromEmail: string;

  @IsString()
  fromName: string;
}

export class PaymentConfigDto {
  @IsString()
  provider: 'RAZORPAY' | 'STRIPE';

  @IsString()
  publicKey: string;

  @IsString()
  secretKey: string;

  @IsString()
  webhookSecret: string;
}
