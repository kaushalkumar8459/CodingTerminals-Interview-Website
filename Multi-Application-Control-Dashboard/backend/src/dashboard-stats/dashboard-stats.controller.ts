import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { DashboardStatsService } from './dashboard-stats.service';
import { UpdateStatsDto, IncrementStatsDto } from './dto/update-stats.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('dashboard-stats')
@UseGuards(JwtAuthGuard)
export class DashboardStatsController {
  constructor(private dashboardStatsService: DashboardStatsService) {}

  @Get('overview')
  async getDashboardOverview() {
    return this.dashboardStatsService.getDashboardOverview();
  }

  @Get()
  async getStats() {
    return this.dashboardStatsService.getStats();
  }

  @Get(':module')
  async getModuleStats(@Param('module') module: string) {
    return this.dashboardStatsService.getModuleStats(module);
  }

  @Patch('update')
  async updateStats(@Body() updateStatsDto: UpdateStatsDto) {
    return this.dashboardStatsService.updateStats(updateStatsDto.module, updateStatsDto.metric, updateStatsDto.value);
  }

  @Patch('increment')
  async incrementStat(@Body() incrementStatsDto: IncrementStatsDto) {
    return this.dashboardStatsService.incrementStat(incrementStatsDto.module, incrementStatsDto.metric, incrementStatsDto.increment);
  }
}
