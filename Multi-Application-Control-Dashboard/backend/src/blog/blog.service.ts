import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BlogPost, BlogPostDocument, BlogStatus } from './schemas/blog-post.schema';

@Injectable()
export class BlogService {
  constructor(@InjectModel(BlogPost.name) private blogModel: Model<BlogPostDocument>) {}

  async create(title: string, content: string, author: string, excerpt?: string, tags?: string[]) {
    const post = new this.blogModel({ title, content, author, excerpt, tags, status: 'draft' });
    return post.save();
  }

  async findAll(status?: string) {
    const query = status ? { status, isDeleted: false } : { isDeleted: false };
    return this.blogModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const post = await this.blogModel.findById(id).exec();
    if (post) await this.blogModel.updateOne({ _id: id }, { $inc: { views: 1 } });
    return post;
  }

  async update(id: string, updateData: any) {
    return this.blogModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async publish(id: string) {
    return this.blogModel.findByIdAndUpdate(
      id,
      { status: 'published', publishedDate: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string) {
    return this.blogModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
  }

  async like(id: string) {
    return this.blogModel.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true }).exec();
  }

  async getByTag(tag: string) {
    return this.blogModel.find({ tags: tag, status: 'published', isDeleted: false }).exec();
  }

  async search(query: string) {
    return this.blogModel.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ],
      isDeleted: false
    }).exec();
  }

  async getStats() {
    const total = await this.blogModel.countDocuments({ isDeleted: false });
    const published = await this.blogModel.countDocuments({ status: 'published', isDeleted: false });
    const draft = await this.blogModel.countDocuments({ status: 'draft', isDeleted: false });
    const totalViews = await this.blogModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    return { total, published, draft, totalViews: totalViews[0]?.total || 0 };
  }

  async getAllPosts(page: number = 1, limit: number = 10, status?: BlogStatus) {
    const skip = (page - 1) * limit;
    const query = status ? { status } : { status: BlogStatus.PUBLISHED };
    const [posts, total] = await Promise.all([
      this.blogModel
        .find(query)
        .populate('createdBy', 'username email')
        .skip(skip)
        .limit(limit)
        .sort({ publishedAt: -1 }),
      this.blogModel.countDocuments(query),
    ]);

    return {
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getPostById(postId: string) {
    const post = await this.blogModel
      .findByIdAndUpdate(postId, { $inc: { views: 1 } }, { new: true })
      .populate('createdBy', 'username email');

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async createPost(createData: any, userId: string) {
    return await this.blogModel.create({
      ...createData,
      createdBy: new Types.ObjectId(userId),
    });
  }

  async updatePost(postId: string, updateData: any, userId: string) {
    const post = await this.blogModel.findByIdAndUpdate(
      postId,
      { ...updateData, lastModifiedBy: new Types.ObjectId(userId) },
      { new: true },
    );

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async deletePost(postId: string) {
    const result = await this.blogModel.findByIdAndDelete(postId);
    if (!result) throw new NotFoundException('Post not found');
    return { message: 'Post deleted successfully' };
  }

  async getPostsByCategory(category: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.blogModel
        .find({ category, status: BlogStatus.PUBLISHED })
        .skip(skip)
        .limit(limit)
        .sort({ publishedAt: -1 }),
      this.blogModel.countDocuments({ category, status: BlogStatus.PUBLISHED }),
    ]);

    return {
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async searchPosts(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.blogModel
        .find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } },
          ],
          status: BlogStatus.PUBLISHED,
        })
        .skip(skip)
        .limit(limit)
        .sort({ views: -1 }),
      this.blogModel.countDocuments({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
        ],
        status: BlogStatus.PUBLISHED,
      }),
    ]);

    return {
      posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getTrendingPosts(limit: number = 5) {
    return await this.blogModel
      .find({ status: BlogStatus.PUBLISHED })
      .populate('createdBy', 'username email')
      .limit(limit)
      .sort({ views: -1 });
  }

  async publishPost(postId: string) {
    const post = await this.blogModel.findByIdAndUpdate(
      postId,
      {
        status: BlogStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      { new: true },
    );

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async saveDraft(postId: string, updateData: any, userId: string) {
    const post = await this.blogModel.findByIdAndUpdate(
      postId,
      {
        ...updateData,
        status: BlogStatus.DRAFT,
        lastModifiedBy: new Types.ObjectId(userId),
      },
      { new: true },
    );

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
