import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true, enum: RoleType })
  name: RoleType;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: [String], default: [] })
  modules: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
