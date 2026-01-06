import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Post()
  create(@Body() createPermissionDto: any) {
    const { name, description, module, action } = createPermissionDto;
    return this.permissionsService.create(name, description, module, action);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  @Get('module/:module')
  findByModule(@Param('module') module: string) {
    return this.permissionsService.findByModule(module);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: any) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }

  @Get('action/:action')
  getByAction(@Param('action') action: string) {
    return this.permissionsService.getPermissionsByAction(action);
  }
}
