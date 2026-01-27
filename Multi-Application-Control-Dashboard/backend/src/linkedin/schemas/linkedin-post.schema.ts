import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LinkedInPostDocument = LinkedInPost & Document;

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class LinkedInPost extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop()
  scheduledDate?: Date;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: 0 })
  shares: number;

  @Prop()
  imageUrl?: string;

  @Prop({ default: false })
  published: boolean;

  @Prop({ default: null })
  publishedDate: Date;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop()
  linkedInPostId: string;

  @Prop({ required: true })
  createdBy: string; // User ID

  @Prop()
  updatedBy: string;

  @Prop({ type: Object, default: {} })
  analytics: {
    impressions?: number;
    clicks?: number;
    engagementRate?: number;
    reach?: number;
  };

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const LinkedInPostSchema = SchemaFactory.createForClass(LinkedInPost);
LinkedInPostSchema.index({ status: 1, createdAt: -1 });
LinkedInPostSchema.index({ scheduledDate: 1 });
