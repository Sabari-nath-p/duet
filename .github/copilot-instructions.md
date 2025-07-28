# GitHub Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive NestJS-based SAAS platform for notification and payment management with multi-tenant architecture.

## Key Technologies & Patterns
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control (Super Admin, Client, Client User)
- **Caching & Jobs**: Redis with Bull Queue
- **Notifications**: WhatsApp Business API & Email (Nodemailer)
- **Payments**: Razorpay and Stripe integration
- **Architecture**: Multi-tenant with domain-driven design

## Code Style Guidelines
- Use dependency injection and decorators
- Implement proper error handling with custom exceptions
- Follow NestJS module structure (controllers, services, entities, DTOs)
- Use Prisma for database operations
- Implement comprehensive validation with class-validator
- Create reusable guards, interceptors, and pipes
- Use environment variables for configuration
- Implement proper logging and monitoring

## Business Logic
- Multi-tenant system where each client has separate WhatsApp/Email credentials
- Automated recurring payment reminders with escalation strategies
- Template-based messaging with dynamic variables
- Comprehensive analytics and reporting for both clients and super admin
- Webhook handling for payment confirmations
- Custom field support for client users

## Security Considerations
- Implement rate limiting and helmet for security
- Validate webhook signatures from payment providers
- Use bcrypt for password hashing
- Implement proper CORS configuration
- Sanitize user inputs and prevent SQL injection
