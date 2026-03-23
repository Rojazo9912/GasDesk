import { Module } from '@nestjs/common';
import { DepartmentInventoryService } from './department-inventory.service';
import { DepartmentInventoryController } from './department-inventory.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DepartmentInventoryController],
  providers: [DepartmentInventoryService],
})
export class DepartmentInventoryModule {}
