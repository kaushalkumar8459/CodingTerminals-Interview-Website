import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { YouTubePost, YouTubePostDocument } from './schemas/youtube-post.schema';

@Injectable()
export class YouTubeService {
  constructor(@InjectModel(YouTubePost.name) private youtubeModel: Model<YouTubePostDocument>) {}

  async create(title: string, videoId: string, description: string, createdBy: string) {
    const post = new this.youtubeModel({ title, videoId, description, createdBy, status: 'draft' });
    return post.save();
  }

  async findAll(status?: string) {
    const query = status ? { status, isDeleted: false } : { isDeleted: false };
    return this.youtubeModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    return this.youtubeModel.findById(id).exec();
  }

  async update(id: string, updateData: any) {
    return this.youtubeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async schedule(id: string, scheduledDate: Date) {
    return this.youtubeModel.findByIdAndUpdate(
      id,
      { status: 'scheduled', scheduledDate },
      { new: true }
    ).exec();
  }

  async publish(id: string) {
    return this.youtubeModel.findByIdAndUpdate(
      id,
      { status: 'published', publishedDate: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string) {
    return this.youtubeModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
  }

  async getByPlaylist(playlistId: string) {
    return this.youtubeModel.find({ playlistId, status: 'published', isDeleted: false }).exec();
  }

  async getStats() {
    const total = await this.youtubeModel.countDocuments({ isDeleted: false });
    const published = await this.youtubeModel.countDocuments({ status: 'published', isDeleted: false });
    const scheduled = await this.youtubeModel.countDocuments({ status: 'scheduled', isDeleted: false });
    const totalViews = await this.youtubeModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    return { total, published, scheduled, totalViews: totalViews[0]?.total || 0 };
  }
}
