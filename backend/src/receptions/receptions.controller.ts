import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ReceptionsService } from './receptions.service';
import { CreateReceptionDto } from './dto/create-reception.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('receptions')
export class ReceptionsController {
  constructor(private readonly receptionsService: ReceptionsService) {}

  @Post()
  create(@Body() dto: CreateReceptionDto, @CurrentUser() user: any) {
    return this.receptionsService.create(dto, user.id, user.tenantId);
  }

  @Get('orden/:ordenId')
  findByOrden(@Param('ordenId') ordenId: string, @CurrentUser() user: any) {
    return this.receptionsService.findByOrden(ordenId, user.tenantId);
  }
}
