import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireModule, CanView, CanCreate, CanEdit, CanDelete } from '../auth/decorators/permissions.decorator';
import { BlogPostStatus } from './schemas/blog-post.schema';

@Controller('blog')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequireModule('Blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post()
  @CanCreate('Blog')
  async create(@Body() createBlogDto: CreateBlogPostDto, @Request() req) {
    return this.blogService.create({ ...createBlogDto, author: req.user.sub });
  }

  @Get()
  @CanView('Blog')
  async findAll(@Query('status') status?: BlogPostStatus) {
    return this.blogService.findAll(status);
  }

  @Get('search')
  @CanView('Blog')
  async search(@Query('q') query: string) {
    return this.blogService.search(query);
  }

  @Get('stats')
  @CanView('Blog')
  async getStats() {
    return this.blogService.getStats();
  }

  @Get('author/:authorId')
  @CanView('Blog')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.blogService.findByAuthor(authorId);
  }

  @Get(':id')
  @CanView('Blog')
  async findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Put(':id')
  @CanEdit('Blog')
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogPostDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  @CanDelete('Blog')
  async delete(@Param('id') id: string) {
    return this.blogService.delete(id);
  }

  @Post(':id/publish')
  @CanEdit('Blog')
  async publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  @Post(':id/unpublish')
  @CanEdit('Blog')
  async unpublish(@Param('id') id: string) {
    return this.blogService.unpublish(id);
  }
}