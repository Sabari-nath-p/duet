import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLIENT = 'CLIENT',
  CLIENT_USER = 'CLIENT_USER',
}

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User full name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'User password', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'Client ID for CLIENT_USER role', required: false })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({ description: 'User active status', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Billing start date for the user (when their payment cycle begins)', required: false })
  @IsOptional()
  @IsDateString()
  billingStartDate?: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'User full name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'User active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Client ID', required: false })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({ description: 'Billing start date for the user', required: false })
  @IsOptional()
  @IsDateString()
  billingStartDate?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  clientId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
