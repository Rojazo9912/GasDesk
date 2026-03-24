import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @Permissions(Permission.MANAGE_BUDGETS)
  create(@CurrentUser() user: any, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(user.tenantId, dto);
  }

  @Get()
  @Permissions(Permission.VIEW_BUDGETS)
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
  @Permissions(Permission.MANAGE_BUDGETS)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @Permissions(Permission.MANAGE_BUDGETS)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.budgetsService.remove(id, user.tenantId);
  }
}
