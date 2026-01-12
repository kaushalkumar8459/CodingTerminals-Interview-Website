import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DashboardStats, DashboardStatsDocument } from './schemas/dashboard-stats.schema';

@Injectable()
export class DashboardStatsService {
  constructor(@InjectModel(DashboardStats.name) private dashboardStatsModel: Model<DashboardStatsDocument>) {}

  async updateStats(module: string, metric: string, value: number) {
    const stats = await this.dashboardStatsModel.findOneAndUpdate(
      { module, metric },
      { $set: { value, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return stats;
  }

  async incrementStat(module: string, metric: string, increment: number = 1) {
    const stats = await this.dashboardStatsModel.findOneAndUpdate(
      { module, metric },
      { $inc: { value: increment }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return stats;
  }

  async getStats(module?: string) {
    const query = module ? { module } : {};
    return this.dashboardStatsModel.find(query).sort({ module: 1, metric: 1 }).exec();
  }

  async getModuleStats(module: string) {
    return this.dashboardStatsModel.find({ module }).exec();
  }

  async getDashboardOverview() {
    const stats = await this.dashboardStatsModel.find().exec();
    const overview = {};
    
    stats.forEach(stat => {
      if (!overview[stat.module]) {
        overview[stat.module] = {};
      }
      overview[stat.module][stat.metric] = stat.value;
    });
    
    return overview;
  }

  async resetStats(module: string) {
    return this.dashboardStatsModel.deleteMany({ module });
  }
}
