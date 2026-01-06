import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { YouTubeService } from './youtube.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('youtube')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class YouTubeController {
  constructor(private youtubeService: YouTubeService) {}

  @Post()
  @Roles('admin', 'super_admin')
  async createVideo(@Body() createData: any, @Request() req) {
    return await this.youtubeService.createVideo(createData, req.user.sub);
  }

  @Get()
  async getAllVideos(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return await this.youtubeService.getAllVideos(page, limit);
  }

  @Get('trending')
  async getTrendingVideos(@Query('limit') limit: number = 10) {
    return await this.youtubeService.getTrendingVideos(limit);
  }

  @Get('category/:category')
  async getVideosByCategory(
    @Param('category') category: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.youtubeService.getVideosByCategory(category, page, limit);
  }

  @Get('search/:query')
  async searchVideos(
    @Param('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.youtubeService.searchVideos(query, page, limit);
  }

  @Get(':id')
  async getVideoById(@Param('id') videoId: string) {
    return await this.youtubeService.getVideoById(videoId);
  }

  @Put(':id')
  @Roles('admin', 'super_admin')
  async updateVideo(@Param('id') videoId: string, @Body() updateData: any, @Request() req) {
    return await this.youtubeService.updateVideo(videoId, updateData, req.user.sub);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  async deleteVideo(@Param('id') videoId: string) {
    return await this.youtubeService.deleteVideo(videoId);
  }

  @Get('stats')
  getStats() {
    return this.youtubeService.getStats();
  }

  @Get('playlist/:playlistId')
  getByPlaylist(@Param('playlistId') playlistId: string) {
    return this.youtubeService.getByPlaylist(playlistId);
  }

  @Post(':id/schedule')
  schedule(@Param('id') id: string, @Body('scheduledDate') scheduledDate: Date) {
    return this.youtubeService.schedule(id, scheduledDate);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.youtubeService.publish(id);
  }
}
