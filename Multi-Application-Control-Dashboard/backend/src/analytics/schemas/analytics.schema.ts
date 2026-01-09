import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsDocument = Analytics & Document;

@Schema({ timestamps: true })
export class Analytics {
  @Prop({ type: String, required: true })
  module: string;

  @Prop({ type: String, required: true })
  eventType: string;

  @Prop({ type: String })
  userId?: string;

  @Prop({ type: Object })
  metadata?: any;

  @Prop({ type: Number, default: 1 })
  count: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);
