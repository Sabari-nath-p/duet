# ScheduRemind - Complete API Documentation & Workflow Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Authentication System](#authentication-system)
5. [API Endpoints Specification](#api-endpoints-specification)
6. [Data Models](#data-models)
7. [Workflow Diagrams](#workflow-diagrams)
8. [Frontend Integration Guide](#frontend-integration-guide)
9. [Mobile App Integration](#mobile-app-integration)
10. [WebSocket Events](#websocket-events)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)

---

## 🎯 Project Overview

**ScheduRemind** is a comprehensive NestJS-based SAAS platform for notification and payment management with multi-tenant architecture. The platform enables businesses to:

- Manage automated payment reminders via WhatsApp & Email
- Handle recurring billing with Razorpay and Stripe integration
- Implement template-based messaging with dynamic variables
- Provide analytics and reporting for both clients and super admin
- Support multi-tenant architecture with role-based access control

### Key Features
- **Multi-tenant Architecture**: Separate client instances with isolated data
- **Payment Integration**: Razorpay and Stripe support with webhook handling
- **Notification Channels**: WhatsApp Business API and Email (Nodemailer)
- **Role-based Access**: SUPER_ADMIN, CLIENT, CLIENT_USER roles
- **Template System**: Dynamic message templates with variable substitution
- **Analytics Dashboard**: Comprehensive reporting and insights
- **Automated Workflows**: Cron-based payment reminders and escalations

---

## 🏗️ Architecture

### Technology Stack
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache & Jobs**: Redis with Bull Queue
- **Authentication**: JWT with role-based access control
- **API Documentation**: Swagger/OpenAPI
- **File Storage**: Local/Cloud storage support

### Project Structure
```
src/
├── auth/                 # Authentication module
├── users/               # User management
├── clients/             # Client management
├── notifications/       # Notification system
├── templates/           # Message templates
├── payments/           # Payment processing
├── subscriptions/      # Subscription management
├── analytics/          # Analytics and reporting
├── webhooks/           # Webhook handlers
├── cron/               # Scheduled jobs
├── common/             # Shared utilities
├── config/             # Configuration
└── prisma/             # Database schema
```

---

## ⚙️ Environment Setup

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/scheduremind?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_EXPIRES_IN="7d"

# API Configuration
PORT=3000
NODE_ENV="development"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# WhatsApp Business API (Global fallback)
WHATSAPP_BASE_URL="https://graph.facebook.com/v17.0"

# Email Configuration (Global fallback)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false

# Payment Providers
RAZORPAY_BASE_URL="https://api.razorpay.com/v1"
STRIPE_BASE_URL="https://api.stripe.com/v1"

# Frontend URL
FRONTEND_URL="http://localhost:3001"

# Security
CORS_ORIGIN="http://localhost:3001"
WEBHOOK_SECRET="your-webhook-secret-change-in-production"
```

### Installation & Setup
```bash
# Clone repository
git clone https://github.com/Sabari-nath-p/duet.git
cd duet

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run start:dev
```

---

## 🔐 Authentication System

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "CLIENT|CLIENT_USER|SUPER_ADMIN",
  "clientId": "client_id_if_applicable",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Authentication Flow
1. User submits credentials
2. Server validates credentials
3. JWT token generated with user info
4. Token returned with refresh token
5. Client stores tokens securely
6. Token included in Authorization header for protected routes

---

## 🔗 API Endpoints Specification

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST /auth/login
**Description**: Authenticate user and get JWT tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 604800,
  "user": {
    "id": "cm5k7x8y9z0a1b2c3d4e5f",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CLIENT",
    "clientId": "cm5k7x8y9z0a1b2c3d4e5g",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

#### POST /auth/register
**Description**: Register new user

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "CLIENT_USER",
  "clientId": "cm5k7x8y9z0a1b2c3d4e5g" // Required for CLIENT_USER
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "cm5k7x8y9z0a1b2c3d4e5h",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "CLIENT_USER",
    "isActive": true
  }
}
```

#### POST /auth/refresh
**Description**: Refresh JWT token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 604800
}
```

#### POST /auth/forgot-password
**Description**: Request password reset

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200)**:
```json
{
  "message": "Password reset email sent"
}
```

#### POST /auth/reset-password
**Description**: Reset password with token

**Request Body**:
```json
{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response (200)**:
```json
{
  "message": "Password reset successfully"
}
```

### User Management Endpoints

#### GET /users
**Description**: Get all users (with pagination and filters)

**Headers**:
```
Authorization: Bearer {access_token}
```

**Query Parameters**:
```
?page=1&limit=10&role=CLIENT&search=john&clientId=cm5k7x8y9z0a1b2c3d4e5g
```

**Response (200)**:
```json
{
  "data": [
    {
      "id": "cm5k7x8y9z0a1b2c3d4e5f",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "role": "CLIENT",
      "clientId": "cm5k7x8y9z0a1b2c3d4e5g",
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z",
      "client": {
        "id": "cm5k7x8y9z0a1b2c3d4e5g",
        "name": "Acme Corp",
        "domain": "acme.com"
      }
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### GET /users/:id
**Description**: Get user by ID

**Response (200)**:
```json
{
  "id": "cm5k7x8y9z0a1b2c3d4e5f",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "CLIENT",
  "clientId": "cm5k7x8y9z0a1b2c3d4e5g",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  "client": {
    "id": "cm5k7x8y9z0a1b2c3d4e5g",
    "name": "Acme Corp",
    "domain": "acme.com"
  },
  "userSubscriptions": [
    {
      "id": "cm5k7x8y9z0a1b2c3d4e5i",
      "amount": 99.99,
      "currency": "USD",
      "status": "ACTIVE",
      "nextBillingDate": "2025-02-15T10:00:00Z"
    }
  ]
}
```

#### POST /users
**Description**: Create new user

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "CLIENT_USER",
  "clientId": "cm5k7x8y9z0a1b2c3d4e5g",
  "customFields": {
    "department": "Engineering",
    "employeeId": "EMP001"
  }
}
```

#### PUT /users/:id
**Description**: Update user

**Request Body**:
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phone": "+1234567891",
  "isActive": true,
  "customFields": {
    "department": "Engineering",
    "position": "Senior Developer"
  }
}
```

#### DELETE /users/:id
**Description**: Delete user

**Response (200)**:
```json
{
  "message": "User deleted successfully"
}
```

### Client Management Endpoints

#### GET /clients
**Description**: Get all clients (Super Admin only)

**Response (200)**:
```json
{
  "data": [
    {
      "id": "cm5k7x8y9z0a1b2c3d4e5g",
      "name": "Acme Corp",
      "email": "admin@acme.com",
      "domain": "acme.com",
      "isActive": true,
      "subscriptionPlan": "PREMIUM",
      "billingStartDate": "2025-01-01T00:00:00Z",
      "whatsappConfig": {
        "accessToken": "encrypted_token",
        "phoneNumberId": "1234567890",
        "isConfigured": true
      },
      "emailConfig": {
        "smtpHost": "smtp.acme.com",
        "smtpPort": 587,
        "isConfigured": true
      },
      "paymentConfig": {
        "razorpay": {
          "keyId": "rzp_live_...",
          "isConfigured": true
        },
        "stripe": {
          "publicKey": "pk_live_...",
          "isConfigured": true
        }
      },
      "createdAt": "2025-01-01T10:00:00Z",
      "_count": {
        "users": 25,
        "templates": 10,
        "notifications": 150
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /clients
**Description**: Create new client

**Request Body**:
```json
{
  "name": "New Corp",
  "email": "admin@newcorp.com",
  "domain": "newcorp.com",
  "subscriptionPlan": "BASIC",
  "billingStartDate": "2025-02-01T00:00:00Z",
  "whatsappConfig": {
    "accessToken": "whatsapp_access_token",
    "phoneNumberId": "1234567890"
  },
  "emailConfig": {
    "smtpHost": "smtp.newcorp.com",
    "smtpPort": 587,
    "smtpUsername": "notifications@newcorp.com",
    "smtpPassword": "smtp_password"
  },
  "paymentConfig": {
    "razorpay": {
      "keyId": "rzp_test_...",
      "keySecret": "rzp_secret_..."
    }
  }
}
```

### Subscription Management Endpoints

#### GET /subscriptions
**Description**: Get user subscriptions

**Query Parameters**:
```
?status=ACTIVE&userId=cm5k7x8y9z0a1b2c3d4e5f&page=1&limit=10
```

**Response (200)**:
```json
{
  "data": [
    {
      "id": "cm5k7x8y9z0a1b2c3d4e5i",
      "userId": "cm5k7x8y9z0a1b2c3d4e5f",
      "planName": "Premium Plan",
      "amount": 99.99,
      "currency": "USD",
      "status": "ACTIVE",
      "paymentMethod": "RAZORPAY",
      "razorpaySubscriptionId": "sub_1234567890",
      "startDate": "2025-01-15T10:00:00Z",
      "nextBillingDate": "2025-02-15T10:00:00Z",
      "billingCycle": "MONTHLY",
      "isRecurring": true,
      "user": {
        "id": "cm5k7x8y9z0a1b2c3d4e5f",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@example.com",
        "phone": "+1234567890"
      },
      "payments": [
        {
          "id": "cm5k7x8y9z0a1b2c3d4e5j",
          "amount": 99.99,
          "status": "COMPLETED",
          "paymentDate": "2025-01-15T10:00:00Z",
          "razorpayPaymentId": "pay_1234567890"
        }
      ]
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /subscriptions
**Description**: Create new subscription

**Request Body**:
```json
{
  "userId": "cm5k7x8y9z0a1b2c3d4e5f",
  "planName": "Premium Plan",
  "amount": 99.99,
  "currency": "USD",
  "billingCycle": "MONTHLY",
  "paymentMethod": "RAZORPAY",
  "startDate": "2025-02-01T00:00:00Z",
  "isRecurring": true,
  "paymentConfig": {
    "razorpay": {
      "planId": "plan_1234567890"
    }
  }
}
```

#### PUT /subscriptions/:id
**Description**: Update subscription

**Request Body**:
```json
{
  "status": "PAUSED",
  "amount": 149.99,
  "nextBillingDate": "2025-03-15T10:00:00Z"
}
```

### Template Management Endpoints

#### GET /templates
**Description**: Get message templates

**Response (200)**:
```json
{
  "data": [
    {
      "id": "cm5k7x8y9z0a1b2c3d4e5k",
      "name": "Payment Reminder",
      "type": "PAYMENT_REMINDER",
      "channel": "WHATSAPP",
      "subject": "Payment Due Reminder",
      "content": "Hi {{firstName}}, your payment of {{amount}} {{currency}} is due on {{dueDate}}. Please pay at {{paymentLink}}",
      "variables": ["firstName", "amount", "currency", "dueDate", "paymentLink"],
      "isActive": true,
      "clientId": "cm5k7x8y9z0a1b2c3d4e5g",
      "enablePaymentReminders": true,
      "reminderDays": [1, 3, 7],
      "includePaymentLink": true,
      "escalationTemplate": true,
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /templates
**Description**: Create new template

**Request Body**:
```json
{
  "name": "Welcome Message",
  "type": "GENERAL",
  "channel": "EMAIL",
  "subject": "Welcome to {{clientName}}",
  "content": "Dear {{firstName}}, welcome to our platform! Your account has been created successfully.",
  "variables": ["firstName", "clientName"],
  "isActive": true,
  "enablePaymentReminders": false,
  "reminderDays": [],
  "includePaymentLink": false,
  "escalationTemplate": false
}
```

### Notification Management Endpoints

#### GET /notifications
**Description**: Get notifications history

**Query Parameters**:
```
?status=SENT&channel=WHATSAPP&userId=cm5k7x8y9z0a1b2c3d4e5f&page=1&limit=10&startDate=2025-01-01&endDate=2025-01-31
```

**Response (200)**:
```json
{
  "data": [
    {
      "id": "cm5k7x8y9z0a1b2c3d4e5l",
      "templateId": "cm5k7x8y9z0a1b2c3d4e5k",
      "userId": "cm5k7x8y9z0a1b2c3d4e5f",
      "userSubscriptionId": "cm5k7x8y9z0a1b2c3d4e5i",
      "channel": "WHATSAPP",
      "recipient": "+1234567890",
      "subject": "Payment Due Reminder",
      "content": "Hi John, your payment of $99.99 USD is due on 2025-02-15...",
      "status": "SENT",
      "sentAt": "2025-01-14T10:00:00Z",
      "deliveredAt": "2025-01-14T10:01:00Z",
      "readAt": "2025-01-14T10:05:00Z",
      "errorMessage": null,
      "metadata": {
        "whatsappMessageId": "wamid.1234567890",
        "campaignId": "campaign_001"
      },
      "template": {
        "name": "Payment Reminder",
        "type": "PAYMENT_REMINDER"
      },
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@example.com"
      }
    }
  ],
  "meta": {
    "total": 250,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /notifications/send
**Description**: Send notification

**Request Body**:
```json
{
  "templateId": "cm5k7x8y9z0a1b2c3d4e5k",
  "userId": "cm5k7x8y9z0a1b2c3d4e5f",
  "userSubscriptionId": "cm5k7x8y9z0a1b2c3d4e5i", // Optional
  "channel": "WHATSAPP",
  "recipient": "+1234567890",
  "variables": {
    "firstName": "John",
    "amount": "99.99",
    "currency": "USD",
    "dueDate": "2025-02-15",
    "paymentLink": "https://app.example.com/pay/12345"
  },
  "scheduleAt": "2025-01-15T10:00:00Z", // Optional for scheduling
  "metadata": {
    "campaignId": "campaign_001",
    "source": "manual"
  }
}
```

**Response (200)**:
```json
{
  "id": "cm5k7x8y9z0a1b2c3d4e5m",
  "status": "QUEUED",
  "message": "Notification queued for sending",
  "estimatedDelivery": "2025-01-15T10:00:30Z"
}
```

### Payment Endpoints

#### GET /payments
**Description**: Get payment history

**Response (200)**:
```json
{
  "data": [
    {
      "id": "cm5k7x8y9z0a1b2c3d4e5j",
      "userSubscriptionId": "cm5k7x8y9z0a1b2c3d4e5i",
      "amount": 99.99,
      "currency": "USD",
      "status": "COMPLETED",
      "paymentMethod": "RAZORPAY",
      "razorpayPaymentId": "pay_1234567890",
      "razorpayOrderId": "order_1234567890",
      "paymentDate": "2025-01-15T10:00:00Z",
      "metadata": {
        "gateway": "razorpay",
        "method": "card"
      },
      "userSubscription": {
        "planName": "Premium Plan",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "user@example.com"
        }
      }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### POST /payments/create-order
**Description**: Create payment order

**Request Body**:
```json
{
  "userSubscriptionId": "cm5k7x8y9z0a1b2c3d4e5i",
  "amount": 99.99,
  "currency": "USD",
  "paymentMethod": "RAZORPAY",
  "metadata": {
    "source": "web_app",
    "planUpgrade": false
  }
}
```

**Response (200)**:
```json
{
  "orderId": "order_1234567890",
  "amount": 99.99,
  "currency": "USD",
  "paymentUrl": "https://checkout.razorpay.com/v1/checkout.js",
  "keyId": "rzp_live_...",
  "metadata": {
    "userSubscriptionId": "cm5k7x8y9z0a1b2c3d4e5i"
  }
}
```

### Analytics Endpoints

#### GET /analytics/dashboard
**Description**: Get dashboard analytics

**Query Parameters**:
```
?startDate=2025-01-01&endDate=2025-01-31&clientId=cm5k7x8y9z0a1b2c3d4e5g
```

**Response (200)**:
```json
{
  "summary": {
    "totalUsers": 250,
    "activeSubscriptions": 180,
    "totalRevenue": 18500.00,
    "notificationsSent": 1250,
    "userGrowth": 15.5,
    "revenueGrowth": 23.2,
    "notificationGrowth": 8.7
  },
  "charts": {
    "revenueOverTime": [
      {
        "date": "2025-01-01",
        "revenue": 850.00,
        "subscriptions": 12
      },
      {
        "date": "2025-01-02",
        "revenue": 920.00,
        "subscriptions": 15
      }
    ],
    "notificationChannels": [
      {
        "channel": "WHATSAPP",
        "count": 750,
        "percentage": 60
      },
      {
        "channel": "EMAIL",
        "count": 500,
        "percentage": 40
      }
    ],
    "paymentMethods": [
      {
        "method": "RAZORPAY",
        "count": 120,
        "amount": 12500.00
      },
      {
        "method": "STRIPE",
        "count": 60,
        "amount": 6000.00
      }
    ]
  },
  "recentActivities": [
    {
      "id": "activity_001",
      "type": "PAYMENT_RECEIVED",
      "description": "Payment of $99.99 received from John Doe",
      "timestamp": "2025-01-15T10:00:00Z",
      "metadata": {
        "userId": "cm5k7x8y9z0a1b2c3d4e5f",
        "amount": 99.99
      }
    }
  ]
}
```

### Webhook Endpoints

#### POST /webhooks/razorpay
**Description**: Handle Razorpay webhooks

**Headers**:
```
X-Razorpay-Signature: {webhook_signature}
```

**Request Body** (Payment Success):
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_1234567890",
        "amount": 9999,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_1234567890",
        "created_at": 1642233600
      }
    }
  }
}
```

#### POST /webhooks/stripe
**Description**: Handle Stripe webhooks

**Headers**:
```
Stripe-Signature: {webhook_signature}
```

---

## 📊 Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'CLIENT' | 'CLIENT_USER';
  clientId?: string;
  isActive: boolean;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  client?: Client;
  userSubscriptions?: UserSubscription[];
  notifications?: Notification[];
}
```

### Client Model
```typescript
interface Client {
  id: string;
  name: string;
  email: string;
  domain: string;
  isActive: boolean;
  subscriptionPlan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  billingStartDate: Date;
  whatsappConfig?: WhatsAppConfig;
  emailConfig?: EmailConfig;
  paymentConfig?: PaymentConfig;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  users?: User[];
  templates?: Template[];
  notifications?: Notification[];
}
```

### UserSubscription Model
```typescript
interface UserSubscription {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  paymentMethod: 'RAZORPAY' | 'STRIPE';
  razorpaySubscriptionId?: string;
  stripeSubscriptionId?: string;
  startDate: Date;
  nextBillingDate?: Date;
  endDate?: Date;
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  isRecurring: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  payments?: Payment[];
  notifications?: Notification[];
}
```

### Template Model
```typescript
interface Template {
  id: string;
  name: string;
  type: 'PAYMENT_REMINDER' | 'WELCOME' | 'GENERAL' | 'OVERDUE';
  channel: 'EMAIL' | 'WHATSAPP';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  clientId: string;
  
  // Payment reminder specific fields
  enablePaymentReminders: boolean;
  reminderDays: number[];
  includePaymentLink: boolean;
  escalationTemplate: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  client?: Client;
  notifications?: Notification[];
}
```

### Notification Model
```typescript
interface Notification {
  id: string;
  templateId: string;
  userId: string;
  userSubscriptionId?: string;
  channel: 'EMAIL' | 'WHATSAPP';
  recipient: string;
  subject?: string;
  content: string;
  status: 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  
  // Relations
  template?: Template;
  user?: User;
  userSubscription?: UserSubscription;
}
```

### Payment Model
```typescript
interface Payment {
  id: string;
  userSubscriptionId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'RAZORPAY' | 'STRIPE';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  stripePaymentIntentId?: string;
  paymentDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  userSubscription?: UserSubscription;
}
```

---

## 🔄 Workflow Diagrams

### 1. User Registration Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant E as Email Service

    U->>F: Fill registration form
    F->>A: POST /auth/register
    A->>D: Check if email exists
    D-->>A: Email availability
    A->>D: Create user record
    D-->>A: User created
    A->>E: Send welcome email
    A-->>F: Success response
    F-->>U: Registration successful
```

### 2. Payment Reminder Flow
```mermaid
sequenceDiagram
    participant C as Cron Job
    participant A as API
    participant D as Database
    participant Q as Queue
    participant W as WhatsApp
    participant E as Email

    C->>A: Check due payments
    A->>D: Query subscriptions
    D-->>A: Due subscriptions
    A->>D: Get reminder templates
    D-->>A: Templates
    A->>Q: Queue notifications
    Q->>W: Send WhatsApp message
    Q->>E: Send email
    W-->>Q: Delivery status
    E-->>Q: Delivery status
    Q->>D: Update notification status
```

### 3. Payment Processing Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant R as Razorpay
    participant D as Database
    participant N as Notification

    U->>F: Click pay button
    F->>A: POST /payments/create-order
    A->>R: Create order
    R-->>A: Order details
    A-->>F: Payment URL & order ID
    F->>R: Process payment
    R->>A: Webhook: payment.captured
    A->>D: Update payment status
    A->>N: Send payment confirmation
    A->>D: Update subscription
```

---

## 🖥️ Frontend Integration Guide

### Setting Up API Client

```javascript
// api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          localStorage.setItem('accessToken', response.data.accessToken);
          // Retry the original request
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Authentication Service

```javascript
// authService.js
import apiClient from './api';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
};
```

### Data Fetching Hooks (React)

```javascript
// hooks/useUsers.js
import { useState, useEffect } from 'react';
import apiClient from '../services/api';

export const useUsers = (filters = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...filters
      });
      
      const response = await apiClient.get(`/users?${params}`);
      setUsers(response.data.data);
      setPagination(response.data.meta);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers
  };
};
```

### Dashboard Component Example

```jsx
// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Select } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  NotificationOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import apiClient from '../services/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await apiClient.get('/analytics/dashboard', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={analytics.summary.totalUsers}
              prefix={<UserOutlined />}
              suffix={`+${analytics.summary.userGrowth}%`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={analytics.summary.totalRevenue}
              prefix={<DollarOutlined />}
              suffix={`+${analytics.summary.revenueGrowth}%`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Subscriptions"
              value={analytics.summary.activeSubscriptions}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Notifications Sent"
              value={analytics.summary.notificationsSent}
              prefix={<NotificationOutlined />}
              suffix={`+${analytics.summary.notificationGrowth}%`}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Activities">
        <Table
          dataSource={analytics.recentActivities}
          columns={[
            {
              title: 'Activity',
              dataIndex: 'description',
              key: 'description'
            },
            {
              title: 'Time',
              dataIndex: 'timestamp',
              key: 'timestamp',
              render: (timestamp) => new Date(timestamp).toLocaleString()
            }
          ]}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
```

---

## 📱 Mobile App Integration

### Flutter API Service

```dart
// services/api_service.dart
import 'package:dio/dio.dart';
import 'package:get_storage/get_storage.dart';

class ApiService {
  late Dio _dio;
  final GetStorage _storage = GetStorage();
  final String baseUrl = 'http://localhost:3000/api';

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: Duration(seconds: 30),
      receiveTimeout: Duration(seconds: 30),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = _storage.read('access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await _refreshToken();
          // Retry request
          final response = await _dio.fetch(error.requestOptions);
          handler.resolve(response);
        } else {
          handler.next(error);
        }
      },
    ));
  }

  Future<void> _refreshToken() async {
    final refreshToken = _storage.read('refresh_token');
    if (refreshToken != null) {
      try {
        final response = await _dio.post('/auth/refresh', 
          data: {'refreshToken': refreshToken}
        );
        _storage.write('access_token', response.data['accessToken']);
      } catch (e) {
        _storage.remove('access_token');
        _storage.remove('refresh_token');
        // Navigate to login
      }
    }
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  Future<Response> delete(String path) {
    return _dio.delete(path);
  }
}
```

### Flutter Authentication Service

```dart
// services/auth_service.dart
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'api_service.dart';
import '../models/user_model.dart';

class AuthService extends GetxService {
  final ApiService _apiService = Get.find<ApiService>();
  final GetStorage _storage = GetStorage();
  
  final Rx<User?> _currentUser = Rx<User?>(null);
  User? get currentUser => _currentUser.value;
  bool get isLoggedIn => _currentUser.value != null;

  @override
  void onInit() {
    super.onInit();
    _loadStoredUser();
  }

  void _loadStoredUser() {
    final userData = _storage.read('user');
    if (userData != null) {
      _currentUser.value = User.fromJson(userData);
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await _apiService.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      final data = response.data;
      _storage.write('access_token', data['accessToken']);
      _storage.write('refresh_token', data['refreshToken']);
      _storage.write('user', data['user']);
      
      _currentUser.value = User.fromJson(data['user']);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    try {
      await _apiService.post('/auth/register', data: userData);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.post('/auth/logout');
    } finally {
      _storage.remove('access_token');
      _storage.remove('refresh_token');
      _storage.remove('user');
      _currentUser.value = null;
    }
  }
}
```

### Flutter Models

```dart
// models/user_model.dart
class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String phone;
  final String role;
  final String? clientId;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.role,
    this.clientId,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      phone: json['phone'],
      role: json['role'],
      clientId: json['clientId'],
      isActive: json['isActive'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'role': role,
      'clientId': clientId,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
```

### Flutter Dashboard Controller

```dart
// controllers/dashboard_controller.dart
import 'package:get/get.dart';
import '../services/api_service.dart';
import '../models/analytics_model.dart';

class DashboardController extends GetxController {
  final ApiService _apiService = Get.find<ApiService>();
  
  final RxBool isLoading = false.obs;
  final Rx<Analytics?> analytics = Rx<Analytics?>(null);
  final RxList<Activity> recentActivities = <Activity>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    try {
      isLoading.value = true;
      
      final response = await _apiService.get('/analytics/dashboard');
      analytics.value = Analytics.fromJson(response.data);
      recentActivities.value = (response.data['recentActivities'] as List)
          .map((activity) => Activity.fromJson(activity))
          .toList();
    } catch (e) {
      Get.snackbar('Error', 'Failed to load dashboard data');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> refreshData() async {
    await fetchDashboardData();
  }
}
```

---

## 🔌 WebSocket Events

### Real-time Notifications

```javascript
// WebSocket connection for real-time updates
const socket = io('ws://localhost:3000', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

// Listen for notification updates
socket.on('notification:sent', (data) => {
  console.log('Notification sent:', data);
  // Update UI
});

socket.on('notification:delivered', (data) => {
  console.log('Notification delivered:', data);
  // Update delivery status
});

socket.on('payment:received', (data) => {
  console.log('Payment received:', data);
  // Update payment status
});

socket.on('subscription:updated', (data) => {
  console.log('Subscription updated:', data);
  // Refresh subscription data
});
```

### Event Types

```typescript
interface NotificationEvent {
  type: 'notification:sent' | 'notification:delivered' | 'notification:failed';
  data: {
    notificationId: string;
    userId: string;
    status: string;
    timestamp: string;
  };
}

interface PaymentEvent {
  type: 'payment:received' | 'payment:failed';
  data: {
    paymentId: string;
    userSubscriptionId: string;
    amount: number;
    status: string;
    timestamp: string;
  };
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ],
  "timestamp": "2025-01-15T10:00:00Z",
  "path": "/auth/login"
}
```

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 400 | Bad Request | Invalid input data, validation errors |
| 401 | Unauthorized | Invalid or expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email, conflicting data |
| 422 | Unprocessable Entity | Business logic validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side errors |

---

## 🛡️ Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642233600
```

### Rate Limits by Endpoint

| Endpoint Category | Limit | Window |
|------------------|--------|---------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 1 hour |
| Notifications | 50 requests | 1 hour |
| Webhooks | 1000 requests | 1 hour |

---

## 🚀 Getting Started Checklist

### Backend Setup
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Configure environment variables
- [ ] Setup PostgreSQL database
- [ ] Setup Redis instance
- [ ] Run database migrations (`npx prisma db push`)
- [ ] Start development server (`npm run start:dev`)

### Frontend Development
- [ ] Setup API client with authentication
- [ ] Implement login/logout functionality
- [ ] Create dashboard with analytics
- [ ] Add user management features
- [ ] Implement notification system
- [ ] Add payment integration

### Mobile App Development
- [ ] Setup Flutter project with GetX
- [ ] Configure API service with Dio
- [ ] Implement authentication screens
- [ ] Create dashboard with charts
- [ ] Add CRUD operations for all entities
- [ ] Implement real-time updates
- [ ] Add offline support

### Testing
- [ ] Test all API endpoints
- [ ] Verify authentication flows
- [ ] Test payment processing
- [ ] Validate notification delivery
- [ ] Check role-based permissions
- [ ] Test webhook handling

---

## 📞 Support & Documentation

### API Testing
- Swagger UI: `http://localhost:3000/api/docs`
- Postman Collection: Available in `/docs` folder

### Additional Resources
- Database Schema: See `prisma/schema.prisma`
- Environment Variables: See `.env.example`
- Docker Setup: See `docker-compose.yml`

This comprehensive documentation provides everything needed to build frontend and mobile applications that integrate with the ScheduRemind platform. All API endpoints, data models, and workflows are detailed with complete request/response examples.
