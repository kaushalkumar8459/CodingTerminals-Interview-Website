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

  // Base role type for the user
  @Prop({ required: true, enum: RoleType, default: RoleType.NORMAL_USER })
  role: RoleType;

  // Reference to custom role document (for admin-defined permissions)
  @Prop({ type: Types.ObjectId, ref: 'Role' })
  customRoleId?: Types.ObjectId;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  // Modules assigned to this user (overrides role-based module access)
  @Prop({ type: [Types.ObjectId], ref: 'AppModule', default: [] })
  assignedModules: Types.ObjectId[];

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  refreshToken?: string;

  // Profile information for normal users
  @Prop()
  phoneNumber?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: Object, default: {} })
  preferences?: Record<string, any>;

  // Virtual property for isActive based on status
  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  // Virtual for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
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
