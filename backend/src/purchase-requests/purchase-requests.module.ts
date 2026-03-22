import { Module } from '@nestjs/common';
import { PurchaseRequestsController } from './purchase-requests.controller';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { EscalationProcessor } from './escalation.processor';

@Module({
  imports: [
    PrismaModule,
    ...(process.env.REDIS_URL ? [BullModule.registerQueue({ name: 'escalations' })] : [])
  ],
  controllers: [PurchaseRequestsController],
  providers: [
    PurchaseRequestsService,
    ...(process.env.REDIS_URL ? [EscalationProcessor] : [])
  ]
})
export class PurchaseRequestsModule {}
