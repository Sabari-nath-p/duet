import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Super Admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: 'admin@scheduremind.com' },
  });

  let superAdmin;
  if (!existingSuperAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        email: 'admin@scheduremind.com',
        password: hashedPassword,
        name: 'Super Admin',
        phone: '+1234567890',
        role: 'SUPER_ADMIN',
      },
    });
  } else {
    superAdmin = existingSuperAdmin;
  }

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create a sample client
  const client = await prisma.client.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Sample Business',
      email: 'client@example.com',
      phone: '+1234567891',
      description: 'A sample business for testing',
      createdById: superAdmin.id,
      isActive: true,
    },
  });

  console.log('✅ Sample client created:', client.name);

    // Create client admin user
  const clientAdminPassword = await bcrypt.hash('client123', 12);
  
  const existingClientAdmin = await prisma.user.findFirst({
    where: { 
      email: 'clientadmin@example.com',
      clientId: client.id,
    },
  });

  let clientAdmin;
  if (!existingClientAdmin) {
    clientAdmin = await prisma.user.create({
      data: {
        email: 'clientadmin@example.com',
        password: clientAdminPassword,
        name: 'Client Admin',
        phone: '+1234567892',
        role: 'CLIENT',
        clientId: client.id,
      },
    });
  } else {
    clientAdmin = existingClientAdmin;
  }

  console.log('✅ Client admin created:', clientAdmin.email);

  // Create sample client users
  const existingUser1 = await prisma.user.findFirst({
    where: { 
      email: 'user1@example.com',
      clientId: client.id,
    },
  });

  let clientUser1;
  if (!existingUser1) {
    clientUser1 = await prisma.user.create({
      data: {
        email: 'user1@example.com',
        name: 'John Doe',
        phone: '+1234567893',
        role: 'CLIENT_USER',
        clientId: client.id,
        isActive: true,
      },
    });
  } else {
    clientUser1 = existingUser1;
  }

  const existingUser2 = await prisma.user.findFirst({
    where: { 
      email: 'user2@example.com',
      clientId: client.id,
    },
  });

  let clientUser2;
  if (!existingUser2) {
    clientUser2 = await prisma.user.create({
      data: {
        email: 'user2@example.com',
        name: 'Jane Smith',
        phone: '+1234567894',
        role: 'CLIENT_USER',
        clientId: client.id,
        isActive: true,
      },
    });
  } else {
    clientUser2 = existingUser2;
  }

  console.log('✅ Client users created:', clientUser1.email, clientUser2.email);

  // Create sample template
  const template = await prisma.template.create({
    data: {
      title: 'Monthly Subscription',
      body: 'Hi {user_name}, your monthly subscription of {amount} is due. Please click the link to pay: {payment_link}',
      amount: 99.99,
      recurringValue: 1,
      recurringInterval: 'MONTHS',
      notificationChannel: 'BOTH',
      paymentProvider: 'RAZORPAY',
      clientId: client.id,
      createdBy: clientAdmin.id,
      isActive: true,
    },
  });

  console.log('✅ Sample template created:', template.title);

  // Create user subscriptions
  const subscription1 = await prisma.userSubscription.create({
    data: {
      userId: clientUser1.id,
      templateId: template.id,
      clientId: client.id,
      title: template.title,
      body: template.body,
      amount: template.amount,
      recurringValue: template.recurringValue,
      recurringInterval: template.recurringInterval,
      notificationChannel: template.notificationChannel,
      paymentProvider: template.paymentProvider,
      nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
    },
  });

  const subscription2 = await prisma.userSubscription.create({
    data: {
      userId: clientUser2.id,
      templateId: template.id,
      clientId: client.id,
      title: 'Custom Subscription',
      body: 'Hi {user_name}, your custom subscription of {amount} is due. Please pay: {payment_link}',
      amount: 149.99,
      recurringValue: 2,
      recurringInterval: 'WEEKS',
      notificationChannel: 'EMAIL',
      paymentProvider: 'STRIPE',
      nextPaymentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      isActive: true,
    },
  });

  console.log('✅ User subscriptions created');

  // Create custom field definitions
  const customField1 = await prisma.customFieldDefinition.create({
    data: {
      clientId: client.id,
      fieldName: 'Customer ID',
      fieldType: 'text',
      isRequired: true,
    },
  });

  const customField2 = await prisma.customFieldDefinition.create({
    data: {
      clientId: client.id,
      fieldName: 'Department',
      fieldType: 'select',
      isRequired: false,
      options: ['Sales', 'Marketing', 'Support', 'Engineering'],
    },
  });

  console.log('✅ Custom field definitions created');

  // Create custom field values
  await prisma.userCustomField.createMany({
    data: [
      {
        userId: clientUser1.id,
        customFieldDefinitionId: customField1.id,
        value: 'CUST001',
      },
      {
        userId: clientUser1.id,
        customFieldDefinitionId: customField2.id,
        value: 'Sales',
      },
      {
        userId: clientUser2.id,
        customFieldDefinitionId: customField1.id,
        value: 'CUST002',
      },
      {
        userId: clientUser2.id,
        customFieldDefinitionId: customField2.id,
        value: 'Marketing',
      },
    ],
  });

  console.log('✅ Custom field values created');

  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('Super Admin: admin@scheduremind.com / admin123');
  console.log('Client Admin: clientadmin@example.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
