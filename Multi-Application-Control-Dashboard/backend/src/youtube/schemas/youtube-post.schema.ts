import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type YouTubePostDocument = YouTubePost & Document;

@Schema({ timestamps: true })
export class YouTubePost {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  videoId: string;

  @Prop()
  videoUrl?: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ 
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft'
  })
  status: string;

  @Prop({ type: Date })
  scheduledDate?: Date;

  @Prop({ type: Date })
  publishedDate?: Date;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop()
  playlistId?: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const YouTubePostSchema = SchemaFactory.createForClass(YouTubePost);
YouTubePostSchema.index({ status: 1, createdAt: -1 });
