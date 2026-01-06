import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { YouTubePost } from './schemas/youtube-post.schema';
import { CreateYouTubePostDto, UpdateYouTubePostDto } from './dto/youtube-post.dto';

@Injectable()
export class YouTubeService {
  constructor(@InjectModel(YouTubePost.name) private youtubeModel: Model<YouTubePost>) {}

  async create(createYouTubeDto: CreateYouTubePostDto) {
    const post = new this.youtubeModel(createYouTubeDto);
    return post.save();
  }

  async findAll(status?: string) {
    if (status) {
      return this.youtubeModel
        .find({ status })
        .sort({ createdAt: -1 })
        .populate('author', 'email firstName lastName')
        .exec();
    }
    return this.youtubeModel
      .find()
      .sort({ createdAt: -1 })
      .populate('author', 'email firstName lastName')
      .exec();
  }

  async findOne(id: string) {
    const post = await this.youtubeModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'email firstName lastName').exec();
    return post;
  }

  async update(id: string, updateYouTubeDto: UpdateYouTubePostDto) {
    return this.youtubeModel
      .findByIdAndUpdate(id, updateYouTubeDto, { new: true })
      .populate('author', 'email firstName lastName')
      .exec();
  }

  async delete(id: string) {
    return this.youtubeModel.findByIdAndDelete(id).exec();
  }

  async publish(id: string) {
    return this.youtubeModel
      .findByIdAndUpdate(
        id,
        { status: 'published', publishedDate: new Date() },
        { new: true }
      )
      .exec();
  }

  async findByAuthor(authorId: string) {
    return this.youtubeModel.find({ author: authorId }).sort({ createdAt: -1 }).exec();
  }

  async getStats() {
    const total = await this.youtubeModel.countDocuments();
    const published = await this.youtubeModel.countDocuments({ status: 'published' });
    const draft = await this.youtubeModel.countDocuments({ status: 'draft' });
    const totalViews = (await this.youtubeModel.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]))[0]?.total || 0;
    return { total, published, draft, totalViews };
  }
}
