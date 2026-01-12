import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RoleType } from '../../roles/schemas/role.schema';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: RoleType, default: RoleType.VIEWER })
  role: RoleType;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ type: [Types.ObjectId], ref: 'Module', default: [] })
  assignedModules: Types.ObjectId[];

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  refreshToken?: string;

  // Virtual property for isActive based on status
  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Enable virtuals in JSON and Object output
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

UserSchema.set('toObject', { virtuals: true });
