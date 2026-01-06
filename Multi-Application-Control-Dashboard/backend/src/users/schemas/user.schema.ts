import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({ default: 'user', enum: ['super_admin', 'admin', 'moderator', 'user'] })
  role: string;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended'] })
  status: string;

  @Prop({ type: [String], default: [] })
  assignedModules: string[];

  @Prop({ default: null })
  lastLogin: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: null })
  profileImage: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
