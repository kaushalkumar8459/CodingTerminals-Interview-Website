import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { BlogPostStatus } from './schemas/blog-post.schema';

@Controller('blog')
@UseGuards(JwtAuthGuard)
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post()
  async create(@Body() createBlogDto: CreateBlogPostDto, @Request() req) {
    return this.blogService.create({ ...createBlogDto, author: req.user.sub });
  }

  @Get()
  async findAll(@Query('status') status?: BlogPostStatus) {
    return this.blogService.findAll(status);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.blogService.search(query);
  }

  @Get('stats')
  async getStats() {
    return this.blogService.getStats();
  }

  @Get('author/:authorId')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.blogService.findByAuthor(authorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogPostDto) {
    return this.blogService.update(id, updateBlogDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.blogService.delete(id);
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  @Post(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.blogService.unpublish(id);
  }
}
