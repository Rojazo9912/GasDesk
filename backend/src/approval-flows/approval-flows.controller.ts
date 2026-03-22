import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApprovalFlowsService } from './approval-flows.service';
import { CreateApprovalFlowDto } from './dto/create-approval-flow.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Rol } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('approval-flows')
@Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
export class ApprovalFlowsController {
  constructor(private readonly approvalFlowsService: ApprovalFlowsService) {}

  @Post()
  create(@Body() createDto: CreateApprovalFlowDto, @CurrentUser() user: any) {
    return this.approvalFlowsService.create(createDto, user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.approvalFlowsService.findAll(user.tenantId);
  }

  @Patch('reorder')
  reorder(@Body('flowIds') flowIds: string[], @CurrentUser() user: any) {
    return this.approvalFlowsService.reorderLevels(flowIds, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.approvalFlowsService.remove(id, user.tenantId);
  }
}
