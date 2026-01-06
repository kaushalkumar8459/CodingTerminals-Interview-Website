import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModuleDocument = AppModule & Document;

@Schema({ timestamps: true })
export class AppModule {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop()
  icon: string;

  @Prop()
  category: string;

  @Prop({ type: [String], default: [] })
  allowedRoles: string[];

  @Prop({ type: Number, default: 0 })
  usersCount: number;

  @Prop()
  route: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ModuleSchema = SchemaFactory.createForClass(AppModule);
