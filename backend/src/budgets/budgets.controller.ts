import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@CurrentUser() user: any, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(user.tenantId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('anio') anio?: string,
    @Query('mes') mes?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.budgetsService.findAll(
      user.tenantId,
      anio ? parseInt(anio) : undefined,
      mes ? parseInt(mes) : undefined,
      locationId,
    );
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.budgetsService.remove(id, user.tenantId);
  }
}
