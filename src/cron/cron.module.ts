import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [NotificationsModule, PaymentsModule, PrismaModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
