import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LinkedInPost, LinkedInPostDocument, PostStatus } from './schemas/linkedin-post.schema';

@Injectable()
export class LinkedInService {
  constructor(
    @InjectModel(LinkedInPost.name) private linkedinModel: Model<LinkedInPostDocument>,
  ) {}

  async getAllPosts(page: number = 1, limit: number = 10, status?: PostStatus) {
    const skip = (page - 1) * limit;
    const query = status ? { status, isDeleted: false } : { isDeleted: false };
    const [posts, total] = await Promise.all([
      this.linkedinModel
        .find(query)
        .populate('createdBy', 'username email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.linkedinModel.countDocuments(query),
    ]);

    return {
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getPostById(postId: string) {
    const post = await this.linkedinModel
      .findById(postId)
      .populate('createdBy', 'username email');

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async createPost(createData: any, userId: string) {
    const post = await this.linkedinModel.create({
      ...createData,
      createdBy: new Types.ObjectId(userId),
      status: 'draft',
    });

    return post.populate('createdBy', 'username email');
  }

  async updatePost(postId: string, updateData: any, userId: string) {
    const post = await this.linkedinModel.findByIdAndUpdate(
      postId,
      {
        ...updateData,
        lastModifiedBy: new Types.ObjectId(userId),
      },
      { new: true },
    );

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async deletePost(postId: string) {
    const result = await this.linkedinModel.findByIdAndUpdate(postId, { isDeleted: true }, { new: true }).exec();
    if (!result) throw new NotFoundException('Post not found');
    return { message: 'Post deleted successfully' };
  }

  async getScheduledPosts() {
    return await this.linkedinModel
      .find({ status: PostStatus.SCHEDULED, isDeleted: false, scheduledDate: { $lte: new Date() } })
      .populate('createdBy', 'username email')
      .sort({ scheduledFor: 1 });
  }

  async publishPost(postId: string) {
    const post = await this.linkedinModel.findByIdAndUpdate(
      postId,
      {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      { new: true },
    );

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async getAnalytics(postId: string) {
    const post = await this.linkedinModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    return {
      postId: post._id,
      impressions: post.impressions,
      engagements: post.engagements,
      engagementRate: post.impressions ? ((post.engagements / post.impressions) * 100).toFixed(2) : 0,
    };
  }

  async schedule(id: string, scheduledDate: Date) {
    return this.linkedinModel.findByIdAndUpdate(
      id,
      { status: 'scheduled', scheduledDate },
      { new: true }
    ).exec();
  }

  async getStats() {
    const total = await this.linkedinModel.countDocuments({ isDeleted: false });
    const published = await this.linkedinModel.countDocuments({ status: 'published', isDeleted: false });
    const scheduled = await this.linkedinModel.countDocuments({ status: 'scheduled', isDeleted: false });
    const draft = await this.linkedinModel.countDocuments({ status: 'draft', isDeleted: false });
    return { total, published, scheduled, draft };
  }
}
