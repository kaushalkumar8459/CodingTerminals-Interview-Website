import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LinkedInService } from './linkedin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('linkedin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LinkedInController {
  constructor(private linkedinService: LinkedInService) {}

  @Post()
  @Roles('admin', 'super_admin')
  async createPost(@Body() createData: any, @Request() req) {
    return await this.linkedinService.createPost(createData, req.user.sub);
  }

  @Get()
  async getAllPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    return await this.linkedinService.getAllPosts(page, limit, status as any);
  }

  @Get('stats')
  async getStats() {
    return await this.linkedinService.getStats();
  }

  @Get('scheduled')
  async getScheduledPosts() {
    return await this.linkedinService.getScheduledPosts();
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string) {
    return await this.linkedinService.getPostById(postId);
  }

  @Put(':id')
  @Roles('admin', 'super_admin')
  async updatePost(@Param('id') postId: string, @Body() updateData: any, @Request() req) {
    return await this.linkedinService.updatePost(postId, updateData, req.user.sub);
  }

  @Post(':id/schedule')
  @Roles('admin', 'super_admin')
  async schedulePost(@Param('id') postId: string, @Body('scheduledDate') scheduledDate: Date) {
    return await this.linkedinService.schedulePost(postId, scheduledDate);
  }

  @Post(':id/publish')
  @Roles('admin', 'super_admin')
  async publishPost(@Param('id') postId: string) {
    return await this.linkedinService.publishPost(postId);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  async deletePost(@Param('id') postId: string) {
    return await this.linkedinService.deletePost(postId);
  }
}
