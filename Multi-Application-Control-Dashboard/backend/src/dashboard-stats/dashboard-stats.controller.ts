import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { DashboardStatsService } from './dashboard-stats.service';

@Controller('dashboard-stats')
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
  async updateStats(@Body() body: { module: string; metric: string; value: number }) {
    return this.dashboardStatsService.updateStats(body.module, body.metric, body.value);
  }

  @Patch('increment')
  async incrementStat(@Body() body: { module: string; metric: string; increment?: number }) {
    return this.dashboardStatsService.incrementStat(body.module, body.metric, body.increment);
  }
}
