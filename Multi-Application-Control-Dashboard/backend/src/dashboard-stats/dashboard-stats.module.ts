import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardStatsService } from './dashboard-stats.service';
import { DashboardStatsController } from './dashboard-stats.controller';
import { DashboardStats, DashboardStatsSchema } from './schemas/dashboard-stats.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DashboardStats.name, schema: DashboardStatsSchema }])],
  controllers: [DashboardStatsController],
  providers: [DashboardStatsService],
  exports: [DashboardStatsService],
})
export class DashboardStatsModule {}
