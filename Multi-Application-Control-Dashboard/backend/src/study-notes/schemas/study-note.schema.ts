import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class StudyNote extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop()
  category?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: 0 })
  views: number;

  @Prop()
  subject?: string;

  @Prop()
  priority?: 'low' | 'medium' | 'high';
}

export const StudyNoteSchema = SchemaFactory.createForClass(StudyNote);
