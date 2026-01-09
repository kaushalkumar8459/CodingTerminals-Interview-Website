import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from './schemas/analytics.schema';
import { CreateAnalyticsDto, UpdateAnalyticsDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(@InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>) {}

  async track(createAnalyticsDto: CreateAnalyticsDto) {
    const analytics = new this.analyticsModel(createAnalyticsDto);
    return analytics.save();
  }

  async findAll() {
    return this.analyticsModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByModule(module: string) {
    return this.analyticsModel.find({ module }).sort({ createdAt: -1 }).exec();
  }

  async findByEvent(eventType: string) {
    return this.analyticsModel.find({ eventType }).sort({ createdAt: -1 }).exec();
  }

  async findByUserId(userId: string) {
    return this.analyticsModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    return this.analyticsModel.findById(id).exec();
  }

  async update(id: string, updateAnalyticsDto: UpdateAnalyticsDto) {
    return this.analyticsModel
      .findByIdAndUpdate(id, updateAnalyticsDto, { new: true })
      .exec();
  }

  async delete(id: string) {
    return this.analyticsModel.findByIdAndDelete(id).exec();
  }

  async incrementEvent(module: string, eventType: string, increment: number = 1) {
    return this.analyticsModel.findOneAndUpdate(
      { module, eventType },
      { $inc: { count: increment }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    ).exec();
  }

  async getEventStats(module?: string) {
    const query = module ? { module } : {};
    return this.analyticsModel.find(query).sort({ count: -1 }).exec();
  }

  async getAnalyticsByDateRange(startDate: Date, endDate: Date, module?: string) {
    const query = module ? { module, createdAt: { $gte: startDate, $lte: endDate } } : { createdAt: { $gte: startDate, $lte: endDate } };
    return this.analyticsModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getModuleAnalytics(module: string) {
    return this.analyticsModel.aggregate([
      { $match: { module } },
      {
        $group: {
          _id: '$eventType',
          totalCount: { $sum: '$count' },
          lastEvent: { $max: '$createdAt' }
        }
      },
      { $sort: { totalCount: -1 } }
    ]).exec();
  }
}
