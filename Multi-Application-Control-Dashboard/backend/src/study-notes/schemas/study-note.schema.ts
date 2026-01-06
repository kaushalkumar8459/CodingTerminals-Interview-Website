import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudyNoteDocument = StudyNote & Document;

@Schema({ timestamps: true })
export class StudyNote {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  category?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop()
  subject?: string;

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: [String] })
  attachments?: string[];

  @Prop({ 
    enum: ['public', 'private'],
    default: 'private'
  })
  visibility: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop()
  lastModifiedBy?: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const StudyNoteSchema = SchemaFactory.createForClass(StudyNote);
StudyNoteSchema.index({ category: 1, createdAt: -1 });
StudyNoteSchema.index({ tags: 1 });
