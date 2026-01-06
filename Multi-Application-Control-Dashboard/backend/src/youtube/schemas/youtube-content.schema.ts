import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type YouTubeContentDocument = YouTubeContent & Document;

export enum VideoStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class YouTubeContent {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  videoId: string;

  @Prop()
  videoUrl: string;

  @Prop()
  thumbnail: string;

  @Prop()
  thumbnailUrl: string;

  @Prop()
  duration: string;

  @Prop()
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  playlists: string[];

  @Prop({ enum: VideoStatus, default: VideoStatus.DRAFT })
  status: VideoStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastModifiedBy: Types.ObjectId;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop()
  publishedAt: Date;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const YouTubeContentSchema = SchemaFactory.createForClass(YouTubeContent);
