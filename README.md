# ScheduRemind - SAAS Notification & Payment Platform

A comprehensive NestJS-based SAAS platform for automated notification and payment management with multi-tenant architecture.

## 🚀 Features

### Multi-Tenant Architecture
- **Super Admin**: Platform-wide management and analytics
- **Client (Business Owner)**: Manage users, templates, and business settings
- **Client User**: End users who receive notifications and make payments

### Notification System
- **WhatsApp Business API** integration for professional messaging
- **Email notifications** with HTML templates
- **Automated recurring reminders** with escalation strategies
- **Template management** with dynamic variables
- **Custom client templates** per user

### Payment Processing
- **Razorpay** and **Stripe** integration
- **Unique payment links** with expiration
- **Webhook handling** for real-time payment updates
- **Automated payment reminders** with configurable intervals
- **Failed payment handling** and retry logic

### Analytics & Reporting
- **Comprehensive client analytics** (payment success rates, user engagement, revenue trends)
- **Super admin dashboard** with platform-wide insights
- **Template performance metrics**
- **Notification delivery tracking**
- **Real-time analytics** with data export capabilities

### Technical Features
- **PostgreSQL** database with Prisma ORM
- **Redis** for caching and job queues
- **JWT authentication** with role-based access control
- **Rate limiting** and security features
- **Swagger API documentation**
- **Docker deployment** ready
- **Automated cron jobs** for recurring tasks

## 🛠️ Tech Stack

- **Backend**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with Bull Queue
- **Authentication**: JWT with Passport
- **Payments**: Razorpay, Stripe
- **Notifications**: WhatsApp Business API, Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Docker & Docker Compose

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SheduRemind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`
API Documentation: `http://localhost:3000/api/docs`

### Docker Deployment

1. **Using Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```

2. **Building manually**
   ```bash
   npm run docker:build
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `3000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3001` |

### WhatsApp Configuration
Each client can configure their own WhatsApp Business API credentials:
- Business API Key
- Phone Number ID
- Access Token
- Webhook Secret

### Payment Configuration
Clients can configure multiple payment providers:
- Razorpay (Public Key, Secret Key, Webhook Secret)
- Stripe (Public Key, Secret Key, Webhook Secret)

## 📚 API Documentation

The API documentation is automatically generated using Swagger and available at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://your-domain.com/api/docs`

### Main API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/refresh` - Refresh token

#### Client Management
- `GET /api/v1/clients` - List clients
- `POST /api/v1/clients` - Create client
- `PUT /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

#### Template Management
- `GET /api/v1/templates` - List templates
- `POST /api/v1/templates` - Create template
- `PUT /api/v1/templates/:id` - Update template
- `DELETE /api/v1/templates/:id` - Delete template

#### Payment Management
- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Create payment
- `PUT /api/v1/payments/:id/status` - Update payment status

#### Analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard data
- `GET /api/v1/analytics/payments` - Payment analytics
- `GET /api/v1/analytics/notifications` - Notification analytics

## 🔄 Recurring Payment Flow

1. **Template Creation**: Client creates notification templates with payment details
2. **User Subscription**: Users are assigned templates or custom payment schedules
3. **Automated Scheduling**: System schedules notifications based on recurring intervals
4. **Notification Dispatch**: Sends notifications via WhatsApp/Email with payment links
5. **Payment Processing**: Handles payments through Razorpay/Stripe
6. **Webhook Processing**: Updates payment status in real-time
7. **Reminder Logic**: Sends reminders for unpaid invoices with escalation

## 🔐 Security Features

- **JWT Authentication** with role-based access control
- **Rate limiting** to prevent API abuse
- **Helmet** for security headers
- **CORS** configuration
- **Input validation** with class-validator
- **Webhook signature verification**
- **Password hashing** with bcrypt

## 📊 Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: System users with roles
- **Clients**: Business accounts
- **Templates**: Notification templates
- **UserSubscriptions**: User payment schedules
- **Payments**: Payment records
- **NotificationLogs**: Notification history
- **CustomFieldDefinitions**: Client-specific user fields
- **WebhookLogs**: Webhook processing history

## 🔧 Development

### Database Operations
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Deploy migrations (production)
npm run db:deploy

# Reset database
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

### Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

### Linting & Formatting
```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🚀 Deployment

### Production Deployment with Docker

1. **Set up environment variables**
2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run database migrations**
   ```bash
   npm run db:deploy
   ```

3. **Start the application**
   ```bash
   npm run start:prod
   ```

## 📈 Monitoring & Logging

- Structured logging with configurable levels
- Health check endpoints
- Prometheus metrics (optional)
- Error tracking and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**ScheduRemind** - Automating notifications and payments for businesses worldwide.
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# duet
# duet
# duet
