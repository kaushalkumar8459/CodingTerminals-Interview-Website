import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionGuard, ModuleAccessGuard } from '../../auth/guards/permission.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions, RequireModule, CanView, CanCreate, CanEdit, CanDelete } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { RoleType, PermissionAction } from '../../roles/schemas/role.schema';

@Controller('api/blog')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequireModule('Blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  @CanView('Blog')
  async getAllPosts(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.blogService.getAllPosts(user, status);
  }

  @Get(':id')
  @CanView('Blog')
  async getPostById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.getPostById(id, user);
  }

  @Post()
  @CanCreate('Blog')
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() dto: CreateBlogDto, @CurrentUser() user: any) {
    return this.blogService.createPost(dto, user);
  }

  @Put(':id')
  @CanEdit('Blog')
  async updatePost(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() user: any,
  ) {
    return this.blogService.updatePost(id, dto, user);
  }

  @Delete(':id')
  @CanDelete('Blog')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.deletePost(id, user);
  }

  @Put(':id/publish')
  @CanEdit('Blog')
  async publishPost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.publishPost(id, user);
  }

  @Put(':id/unpublish')
  @CanEdit('Blog')
  async unpublishPost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.unpublishPost(id, user);
  }
}
