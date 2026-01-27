import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/schemas/role.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async search(@Query('q') query: string) {
    return this.usersService.search(query);
  }

  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.findOne(req.user.sub);
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles(RoleType.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('me/profile')
  async updateMyProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // Users can only update their own profile fields (not role/status)
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'avatarUrl', 'preferences'];
    const filteredDto: any = {};
    for (const field of allowedFields) {
      if (updateUserDto[field] !== undefined) {
        filteredDto[field] = updateUserDto[field];
      }
    }
    return this.usersService.update(req.user.sub, filteredDto);
  }

  @Delete(':id')
  @Roles(RoleType.SUPER_ADMIN)
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Post(':id/role')
  @Roles(RoleType.SUPER_ADMIN)
  async assignRole(@Param('id') id: string, @Body('role') role: RoleType) {
    return this.usersService.assignRole(id, role);
  }

  @Post(':id/modules')
  @Roles(RoleType.SUPER_ADMIN)
  async assignModules(@Param('id') id: string, @Body('moduleIds') moduleIds: string[]) {
    return this.usersService.assignModules(id, moduleIds);
  }

  @Get(':id/permissions')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  async getUserPermissions(@Param('id') id: string) {
    return this.usersService.getUserPermissions(id);
  }
}
