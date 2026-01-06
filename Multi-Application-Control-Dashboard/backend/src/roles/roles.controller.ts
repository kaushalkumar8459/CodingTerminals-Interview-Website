import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  async create(@Body() roleData: any) {
    return this.rolesService.create(roleData);
  }

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() roleData: any) {
    return this.rolesService.update(id, roleData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }

  @Post(':id/permissions')
  async assignPermissions(@Param('id') id: string, @Body('permissions') permissions: string[]) {
    return this.rolesService.assignPermissions(id, permissions);
  }

  @Post(':id/modules')
  async assignModules(@Param('id') id: string, @Body('modules') modules: string[]) {
    return this.rolesService.assignModules(id, modules);
  }
}
