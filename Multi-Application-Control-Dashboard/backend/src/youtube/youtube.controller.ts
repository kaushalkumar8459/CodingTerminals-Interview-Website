import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { YouTubeService } from './youtube.service';
import { CreateYouTubePostDto, UpdateYouTubePostDto } from './dto/youtube-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('youtube')
@UseGuards(JwtAuthGuard)
export class YouTubeController {
  constructor(private youtubeService: YouTubeService) {}

  @Post()
  async create(@Body() createYouTubeDto: CreateYouTubePostDto, @Request() req) {
    return this.youtubeService.create({ ...createYouTubeDto, author: req.user.sub });
  }

  @Get()
  async findAll(@Query('status') status?: string) {
    return this.youtubeService.findAll(status);
  }

  @Get('stats')
  async getStats() {
    return this.youtubeService.getStats();
  }

  @Get('author/:authorId')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.youtubeService.findByAuthor(authorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.youtubeService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateYouTubeDto: UpdateYouTubePostDto) {
    return this.youtubeService.update(id, updateYouTubeDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.youtubeService.delete(id);
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string) {
    return this.youtubeService.publish(id);
  }
}
