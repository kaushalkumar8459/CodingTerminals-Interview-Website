import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DashboardStatsDocument = DashboardStats & Document;

@Schema({ timestamps: true })
export class DashboardStats {
  @Prop({ type: String, required: true })
  module: string;

  @Prop({ type: String, required: true })
  metric: string;

  @Prop({ type: Number, default: 0 })
  value: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const DashboardStatsSchema = SchemaFactory.createForClass(DashboardStats);
