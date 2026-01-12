import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  module: string;

  @Prop({ enum: ['create', 'read', 'update', 'delete'], required: true })
  action: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
