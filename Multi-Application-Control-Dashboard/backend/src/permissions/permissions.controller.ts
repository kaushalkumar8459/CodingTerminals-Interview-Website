import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Post()
  async create(@Body() permissionData: any) {
    return this.permissionsService.create(permissionData);
  }

  @Get()
  async findAll(@Query('module') module?: string) {
    if (module) {
      return this.permissionsService.findByModule(module);
    }
    return this.permissionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() permissionData: any) {
    return this.permissionsService.update(id, permissionData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }
}
