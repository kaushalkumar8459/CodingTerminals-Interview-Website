import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { LinkedInService } from './linkedin.service';
import { CreateLinkedInPostDto, UpdateLinkedInPostDto } from './dto/linkedin-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PostStatus } from './schemas/linkedin-post.schema';

@Controller('linkedin')
@UseGuards(JwtAuthGuard)
export class LinkedInController {
  constructor(private linkedinService: LinkedInService) {}

  @Post()
  async create(@Body() createLinkedInDto: CreateLinkedInPostDto, @Request() req) {
    return this.linkedinService.create({ ...createLinkedInDto, author: req.user.sub });
  }

  @Get()
  async findAll(@Query('status') status?: PostStatus) {
    return this.linkedinService.findAll(status);
  }

  @Get('scheduled')
  async getScheduled() {
    return this.linkedinService.getScheduledPosts();
  }

  @Get('stats')
  async getStats() {
    return this.linkedinService.getStats();
  }

  @Get('author/:authorId')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.linkedinService.findByAuthor(authorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.linkedinService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateLinkedInDto: UpdateLinkedInPostDto) {
    return this.linkedinService.update(id, updateLinkedInDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.linkedinService.delete(id);
  }

  @Post(':id/schedule')
  async schedule(@Param('id') id: string, @Body('scheduledDate') scheduledDate: Date) {
    return this.linkedinService.schedule(id, scheduledDate);
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string) {
    return this.linkedinService.publish(id);
  }
}
