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
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';

@Controller('api/blog')
@UseGuards(JwtAuthGuard, RoleGuard)
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  @Roles(['SUPER_ADMIN', 'ADMIN', 'VIEWER'])
  async getAllPosts(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.blogService.getAllPosts(user, status);
  }

  @Get(':id')
  @Roles(['SUPER_ADMIN', 'ADMIN', 'VIEWER'])
  async getPostById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.getPostById(id, user);
  }

  @Post()
  @Roles(['SUPER_ADMIN', 'ADMIN'])
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() dto: CreateBlogDto, @CurrentUser() user: any) {
    return this.blogService.createPost(dto, user);
  }

  @Put(':id')
  @Roles(['SUPER_ADMIN', 'ADMIN'])
  async updatePost(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() user: any,
  ) {
    return this.blogService.updatePost(id, dto, user);
  }

  @Delete(':id')
  @Roles(['SUPER_ADMIN', 'ADMIN'])
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.deletePost(id, user);
  }

  @Put(':id/publish')
  @Roles(['SUPER_ADMIN', 'ADMIN'])
  async publishPost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.publishPost(id, user);
  }

  @Put(':id/unpublish')
  @Roles(['SUPER_ADMIN', 'ADMIN'])
  async unpublishPost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogService.unpublishPost(id, user);
  }
}
