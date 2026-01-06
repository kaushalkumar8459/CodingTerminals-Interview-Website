import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogPostDocument = BlogPost & Document;

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class BlogPost {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  excerpt?: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ 
    enum: ['draft', 'published'],
    default: 'draft'
  })
  status: string;

  @Prop({ type: Date })
  publishedDate?: Date;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop()
  featuredImage?: string;

  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
BlogPostSchema.index({ status: 1, createdAt: -1 });
BlogPostSchema.index({ tags: 1 });
