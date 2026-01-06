import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.usersService.getUserStats();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/assign-modules')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async assignModules(@Param('id') id: string, @Body('moduleIds') moduleIds: string[]) {
    return this.usersService.assignModules(id, moduleIds);
  }

  @Post(':id/change-role')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async changeRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.changeUserRole(id, role);
  }

  @Post(':id/change-status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('super_admin')
  async changeStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.changeUserStatus(id, status);
  }
}
