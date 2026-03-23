import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.departmentsService.findAll(user.tenantId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateDepartmentDto, @CurrentUser() user: any) {
    return this.departmentsService.create(user.tenantId, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto, @CurrentUser() user: any) {
    return this.departmentsService.update(user.tenantId, id, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.departmentsService.remove(user.tenantId, id);
  }
}
