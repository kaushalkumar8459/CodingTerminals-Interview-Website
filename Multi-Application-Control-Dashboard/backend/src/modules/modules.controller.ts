import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private modulesService: ModulesService) {}

  @Post()
  async create(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  async findAll() {
    return this.modulesService.findAll();
  }

  @Get('enabled')
  async findEnabled() {
    return this.modulesService.findEnabled();
  }

  @Get('stats')
  async getStats() {
    return this.modulesService.getModuleStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.modulesService.delete(id);
  }

  @Post(':id/toggle')
  async toggleModule(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.modulesService.toggleModule(id, enabled);
  }
}
