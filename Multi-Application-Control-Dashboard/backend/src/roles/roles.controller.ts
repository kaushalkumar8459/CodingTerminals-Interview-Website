import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: any) {
    const { name, description, level, permissions } = createRoleDto;
    return this.rolesService.create(name, description, level, permissions);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: any) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }

  @Get('level/:level')
  getRolesByLevel(@Param('level') level: string) {
    return this.rolesService.getRolesByLevel(level);
  }
}
