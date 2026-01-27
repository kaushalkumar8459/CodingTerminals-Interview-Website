import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { YouTubeService } from './youtube.service';
import { CreateYouTubePostDto, UpdateYouTubePostDto } from './dto/youtube-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireModule, CanView, CanCreate, CanEdit, CanDelete } from '../auth/decorators/permissions.decorator';

@Controller('youtube')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequireModule('YouTube')
export class YouTubeController {
  constructor(private youtubeService: YouTubeService) {}

  @Post()
  @CanCreate('YouTube')
  async create(@Body() createYouTubeDto: CreateYouTubePostDto, @Request() req) {
    return this.youtubeService.create({ ...createYouTubeDto, author: req.user.sub });
  }

  @Get()
  @CanView('YouTube')
  async findAll(@Query('status') status?: string) {
    return this.youtubeService.findAll(status);
  }

  @Get('stats')
  @CanView('YouTube')
  async getStats() {
    return this.youtubeService.getStats();
  }

  @Get('author/:authorId')
  @CanView('YouTube')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.youtubeService.findByAuthor(authorId);
  }

  @Get(':id')
  @CanView('YouTube')
  async findOne(@Param('id') id: string) {
    return this.youtubeService.findOne(id);
  }

  @Put(':id')
  @CanEdit('YouTube')
  async update(@Param('id') id: string, @Body() updateYouTubeDto: UpdateYouTubePostDto) {
    return this.youtubeService.update(id, updateYouTubeDto);
  }

  @Delete(':id')
  @CanDelete('YouTube')
  async delete(@Param('id') id: string) {
    return this.youtubeService.delete(id);
  }

  @Post(':id/publish')
  @CanEdit('YouTube')
  async publish(@Param('id') id: string) {
    return this.youtubeService.publish(id);
  }
}
