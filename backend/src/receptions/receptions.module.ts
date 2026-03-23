import { Module } from '@nestjs/common';
import { ReceptionsController } from './receptions.controller';
import { ReceptionsService } from './receptions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReceptionsController],
  providers: [ReceptionsService],
})
export class ReceptionsModule {}
