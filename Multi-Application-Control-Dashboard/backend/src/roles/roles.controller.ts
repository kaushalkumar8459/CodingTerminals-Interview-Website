import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignModulePermissionsDto, ModulePermissionDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType, PermissionAction } from './schemas/role.schema';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Get('type/:type')
  @Roles(RoleType.SUPER_ADMIN)
  async findByType(@Param('type') type: RoleType) {
    return this.rolesService.findByType(type);
  }

  @Put(':id')
  @Roles(RoleType.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN)
  async delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }

  @Post(':id/module-permissions')
  @Roles(RoleType.SUPER_ADMIN)
  async assignModulePermissions(
    @Param('id') id: string,
    @Body() dto: AssignModulePermissionsDto,
  ) {
    return this.rolesService.assignModulePermissions(id, dto);
  }

  @Post(':id/module-permission')
  @Roles(RoleType.SUPER_ADMIN)
  async addModulePermission(
    @Param('id') id: string,
    @Body() modulePermission: ModulePermissionDto,
  ) {
    return this.rolesService.addModulePermission(id, modulePermission);
  }

  @Delete(':id/module-permission/:moduleId')
  @Roles(RoleType.SUPER_ADMIN)
  async removeModulePermission(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.rolesService.removeModulePermission(id, moduleId);
  }

  @Get(':id/has-permission')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async hasPermission(
    @Param('id') id: string,
    @Query('moduleId') moduleId: string,
    @Query('action') action: PermissionAction,
  ) {
    const hasPermission = await this.rolesService.hasPermission(id, moduleId, action);
    return { hasPermission };
  }

  @Get(':id/module-permissions/:moduleId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async getModulePermissions(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ) {
    const permissions = await this.rolesService.getModulePermissions(id, moduleId);
    return { permissions };
  }
}
