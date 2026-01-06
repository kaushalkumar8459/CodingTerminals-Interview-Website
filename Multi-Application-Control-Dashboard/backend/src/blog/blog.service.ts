import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost, BlogPostStatus } from './schemas/blog-post.schema';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

@Injectable()
export class BlogService {
  constructor(@InjectModel(BlogPost.name) private blogModel: Model<BlogPost>) {}

  async create(createBlogDto: CreateBlogPostDto) {
    const blog = new this.blogModel(createBlogDto);
    return blog.save();
  }

  async findAll(status?: BlogPostStatus) {
    if (status) {
      return this.blogModel.find({ status }).sort({ createdAt: -1 }).populate('author', 'email firstName lastName').exec();
    }
    return this.blogModel.find().sort({ createdAt: -1 }).populate('author', 'email firstName lastName').exec();
  }

  async findOne(id: string) {
    const blog = await this.blogModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'email firstName lastName').exec();
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogPostDto) {
    return this.blogModel.findByIdAndUpdate(id, updateBlogDto, { new: true }).populate('author', 'email firstName lastName').exec();
  }

  async delete(id: string) {
    return this.blogModel.findByIdAndDelete(id).exec();
  }

  async publish(id: string) {
    return this.blogModel.findByIdAndUpdate(
      id,
      { status: BlogPostStatus.PUBLISHED, publishedDate: new Date() },
      { new: true }
    ).exec();
  }

  async unpublish(id: string) {
    return this.blogModel.findByIdAndUpdate(
      id,
      { status: BlogPostStatus.DRAFT },
      { new: true }
    ).exec();
  }

  async findByAuthor(authorId: string) {
    return this.blogModel.find({ author: authorId }).sort({ createdAt: -1 }).exec();
  }

  async search(query: string) {
    return this.blogModel.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
      status: BlogPostStatus.PUBLISHED,
    }).exec();
  }

  async getStats() {
    const total = await this.blogModel.countDocuments();
    const published = await this.blogModel.countDocuments({ status: BlogPostStatus.PUBLISHED });
    const draft = await this.blogModel.countDocuments({ status: BlogPostStatus.DRAFT });
    return { total, published, draft };
  }
}
