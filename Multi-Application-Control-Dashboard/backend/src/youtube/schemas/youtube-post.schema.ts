import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type YouTubePostDocument = YouTubePost & Document;

@Schema({ timestamps: true })
export class YouTubePost extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  videoId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ enum: ['draft', 'published'], default: 'draft' })
  status: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop()
  publishedDate?: Date;
}

export const YouTubePostSchema = SchemaFactory.createForClass(YouTubePost);
