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
export class LinkedInPost {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ 
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft'
  })
  status: string;

  @Prop({ type: Date })
  scheduledDate?: Date;

  @Prop({ type: Date })
  publishedDate?: Date;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: 0 })
  shares: number;

  @Prop()
  linkedinUrl?: string;

  @Prop({ type: Object })
  analytics?: {
    impressions?: number;
    engagementRate?: number;
    clickThroughRate?: number;
  };

  @Prop({ required: true })
  createdBy: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const LinkedInPostSchema = SchemaFactory.createForClass(LinkedInPost);
LinkedInPostSchema.index({ status: 1, createdAt: -1 });
LinkedInPostSchema.index({ scheduledDate: 1 });
