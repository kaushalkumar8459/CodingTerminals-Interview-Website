import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LinkedInPost, PostStatus } from './schemas/linkedin-post.schema';
import { CreateLinkedInPostDto, UpdateLinkedInPostDto } from './dto/linkedin-post.dto';

@Injectable()
export class LinkedInService {
  constructor(@InjectModel(LinkedInPost.name) private linkedinModel: Model<LinkedInPost>) {}

  async create(createLinkedInDto: CreateLinkedInPostDto) {
    const post = new this.linkedinModel(createLinkedInDto);
    return post.save();
  }

  async findAll(status?: PostStatus) {
    if (status) {
      return this.linkedinModel
        .find({ status })
        .sort({ createdAt: -1 })
        .populate('author', 'email firstName lastName')
        .exec();
    }
    return this.linkedinModel
      .find()
      .sort({ createdAt: -1 })
      .populate('author', 'email firstName lastName')
      .exec();
  }

  async findOne(id: string) {
    return this.linkedinModel
      .findById(id)
      .populate('author', 'email firstName lastName')
      .exec();
  }

  async update(id: string, updateLinkedInDto: UpdateLinkedInPostDto) {
    return this.linkedinModel
      .findByIdAndUpdate(id, updateLinkedInDto, { new: true })
      .populate('author', 'email firstName lastName')
      .exec();
  }

  async delete(id: string) {
    return this.linkedinModel.findByIdAndDelete(id).exec();
  }

  async schedule(id: string, scheduledDate: Date) {
    return this.linkedinModel
      .findByIdAndUpdate(
        id,
        { status: PostStatus.SCHEDULED, scheduledDate },
        { new: true }
      )
      .exec();
  }

  async publish(id: string) {
    return this.linkedinModel
      .findByIdAndUpdate(
        id,
        { status: PostStatus.PUBLISHED, published: true, publishedDate: new Date() },
        { new: true }
      )
      .exec();
  }

  async getScheduledPosts() {
    return this.linkedinModel
      .find({
        status: PostStatus.SCHEDULED,
        scheduledDate: { $lte: new Date() },
      })
      .exec();
  }

  async findByAuthor(authorId: string) {
    return this.linkedinModel.find({ author: authorId }).sort({ createdAt: -1 }).exec();
  }

  async getStats() {
    const total = await this.linkedinModel.countDocuments();
    const published = await this.linkedinModel.countDocuments({ status: PostStatus.PUBLISHED });
    const scheduled = await this.linkedinModel.countDocuments({ status: PostStatus.SCHEDULED });
    const draft = await this.linkedinModel.countDocuments({ status: PostStatus.DRAFT });
    return { total, published, scheduled, draft };
  }
}
