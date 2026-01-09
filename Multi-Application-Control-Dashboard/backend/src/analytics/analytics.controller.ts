import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto, UpdateAnalyticsDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @HttpCode(HttpStatus.CREATED)
  async track(@Body() createAnalyticsDto: CreateAnalyticsDto) {
    return this.analyticsService.track(createAnalyticsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.analyticsService.findAll();
  }

  @Get('module/:module')
  @UseGuards(JwtAuthGuard)
  async findByModule(@Param('module') module: string) {
    return this.analyticsService.findByModule(module);
  }

  @Get('event/:eventType')
  @UseGuards(JwtAuthGuard)
  async findByEvent(@Param('eventType') eventType: string) {
    return this.analyticsService.findByEvent(eventType);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findByUserId(@Param('userId') userId: string) {
    return this.analyticsService.findByUserId(userId);
  }

  @Get('stats/module/:module')
  @UseGuards(JwtAuthGuard)
  async getModuleAnalytics(@Param('module') module: string) {
    return this.analyticsService.getModuleAnalytics(module);
  }

  @Get('stats/events')
  @UseGuards(JwtAuthGuard)
  async getEventStats(@Query('module') module?: string) {
    return this.analyticsService.getEventStats(module);
  }

  @Get('range')
  @UseGuards(JwtAuthGuard)
  async getAnalyticsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('module') module?: string,
  ) {
    return this.analyticsService.getAnalyticsByDateRange(
      new Date(startDate),
      new Date(endDate),
      module,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.analyticsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateAnalyticsDto: UpdateAnalyticsDto) {
    return this.analyticsService.update(id, updateAnalyticsDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.analyticsService.delete(id);
  }

  @Post(':module/increment/:eventType')
  @HttpCode(HttpStatus.OK)
  async incrementEvent(
    @Param('module') module: string,
    @Param('eventType') eventType: string,
    @Query('increment') increment?: string,
  ) {
    return this.analyticsService.incrementEvent(
      module,
      eventType,
      increment ? parseInt(increment) : 1,
    );
  }
}
