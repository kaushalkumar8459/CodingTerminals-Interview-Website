import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BlogService } from './blog.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('blog')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post()
  @Roles('admin', 'super_admin')
  async create(@Body() createBlogDto: any, @Request() req) {
    const { title, content, author, excerpt, tags } = createBlogDto;
    return this.blogService.create(title, content, author, excerpt, tags, req.user.sub);
  }

  @Get()
  async findAll(@Query('status') status?: string) {
    return this.blogService.findAll(status);
  }

  @Get('stats')
  async getStats() {
    return this.blogService.getStats();
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.blogService.search(query);
  }

  @Get('tag/:tag')
  async getByTag(@Param('tag') tag: string) {
    return this.blogService.getByTag(tag);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  @Put(':id')
  @Roles('admin', 'super_admin')
  async update(@Param('id') id: string, @Body() updateBlogDto: any, @Request() req) {
    return this.blogService.update(id, updateBlogDto, req.user.sub);
  }

  @Post(':id/publish')
  @Roles('admin', 'super_admin')
  async publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  @Post(':id/like')
  async like(@Param('id') id: string) {
    return this.blogService.like(id);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  async delete(@Param('id') id: string) {
    return this.blogService.delete(id);
  }
}
