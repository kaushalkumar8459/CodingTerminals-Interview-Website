import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AppModule extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: true })
  enabled: boolean;

  @Prop()
  icon: string;

  @Prop()
  category: string;

  @Prop({ type: Number, default: 0 })
  userCount: number;

  @Prop()
  version: string;

  @Prop({ type: Map, of: String, default: {} })
  metadata: Record<string, string>;
}

export const AppModuleSchema = SchemaFactory.createForClass(AppModule);
