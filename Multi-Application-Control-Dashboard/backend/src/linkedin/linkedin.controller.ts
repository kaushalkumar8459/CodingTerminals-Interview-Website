import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { LinkedInService } from './linkedin.service';
import { CreateLinkedInPostDto, UpdateLinkedInPostDto } from './dto/linkedin-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireModule, CanView, CanCreate, CanEdit, CanDelete } from '../auth/decorators/permissions.decorator';
import { PostStatus } from './schemas/linkedin-post.schema';

@Controller('linkedin')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequireModule('LinkedIn')
export class LinkedInController {
  constructor(private linkedinService: LinkedInService) {}

  @Post()
  @CanCreate('LinkedIn')
  async create(@Body() createLinkedInDto: CreateLinkedInPostDto, @Request() req) {
    return this.linkedinService.create({ ...createLinkedInDto, author: req.user.sub });
  }

  @Get()
  @CanView('LinkedIn')
  async findAll(@Query('status') status?: PostStatus) {
    return this.linkedinService.findAll(status);
  }

  @Get('scheduled')
  @CanView('LinkedIn')
  async getScheduled() {
    return this.linkedinService.getScheduledPosts();
  }

  @Get('stats')
  @CanView('LinkedIn')
  async getStats() {
    return this.linkedinService.getStats();
  }

  @Get('author/:authorId')
  @CanView('LinkedIn')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.linkedinService.findByAuthor(authorId);
  }

  @Get(':id')
  @CanView('LinkedIn')
  async findOne(@Param('id') id: string) {
    return this.linkedinService.findOne(id);
  }

  @Put(':id')
  @CanEdit('LinkedIn')
  async update(@Param('id') id: string, @Body() updateLinkedInDto: UpdateLinkedInPostDto) {
    return this.linkedinService.update(id, updateLinkedInDto);
  }

  @Delete(':id')
  @CanDelete('LinkedIn')
  async delete(@Param('id') id: string) {
    return this.linkedinService.delete(id);
  }

  @Post(':id/schedule')
  @CanEdit('LinkedIn')
  async schedule(@Param('id') id: string, @Body('scheduledDate') scheduledDate: Date) {
    return this.linkedinService.schedule(id, scheduledDate);
  }

  @Post(':id/publish')
  @CanEdit('LinkedIn')
  async publish(@Param('id') id: string) {
    return this.linkedinService.publish(id);
  }
}
