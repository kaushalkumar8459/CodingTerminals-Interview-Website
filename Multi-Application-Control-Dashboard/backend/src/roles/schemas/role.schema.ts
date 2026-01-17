import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  NORMAL_USER = 'normal_user',
  VIEWER = 'viewer',
}

// Permission actions for granular access control
export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
}

export type RoleDocument = Role & Document;

// Embedded schema for module permissions
export class ModulePermission {
  @Prop({ type: Types.ObjectId, ref: 'AppModule', required: true })
  moduleId: Types.ObjectId;

  @Prop({ required: true })
  moduleName: string;

  @Prop({ type: [String], enum: Object.values(PermissionAction), default: [] })
  actions: PermissionAction[];
}

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, enum: RoleType })
  type: RoleType;

  @Prop()
  description: string;

  // Module-level permissions with granular actions
  @Prop({ type: [{ moduleId: Types.ObjectId, moduleName: String, actions: [String] }], default: [] })
  modulePermissions: ModulePermission[];

  // Whether this is a system-defined role (cannot be deleted)
  @Prop({ default: false })
  isSystemRole: boolean;

  // Whether this role is active
  @Prop({ default: true })
  isActive: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Indexes for better query performance
RoleSchema.index({ type: 1 });
RoleSchema.index({ isSystemRole: 1 });

// Transform output
RoleSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

RoleSchema.set('toObject', { virtuals: true });
