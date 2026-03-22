import { Module } from '@nestjs/common';
import { ApprovalFlowsService } from './approval-flows.service';
import { ApprovalFlowsController } from './approval-flows.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApprovalFlowsController],
  providers: [ApprovalFlowsService],
})
export class ApprovalFlowsModule {}
