import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ModulesService } from './modules.service';

@Controller('modules')
export class ModulesController {
  constructor(private modulesService: ModulesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.modulesService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.modulesService.getModuleStats();
  }

  @Get('category/:category')
  @UseGuards(JwtAuthGuard)
  async getByCategory(@Param('category') category: string) {
    return this.modulesService.getModulesByCategory(category);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.modulesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async create(@Body() createModuleDto: any) {
    return this.modulesService.create(createModuleDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async update(@Param('id') id: string, @Body() updateModuleDto: any) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async delete(@Param('id') id: string) {
    await this.modulesService.delete(id);
    return { message: 'Module deleted successfully' };
  }

  @Post(':id/enable')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async enable(@Param('id') id: string) {
    return this.modulesService.enableModule(id);
  }

  @Post(':id/disable')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async disable(@Param('id') id: string) {
    return this.modulesService.disableModule(id);
  }

  @Post(':id/toggle')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async toggle(@Param('id') id: string) {
    return this.modulesService.toggleModule(id);
  }
}
