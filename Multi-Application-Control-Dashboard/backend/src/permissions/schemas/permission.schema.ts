import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PermissionAction } from '../../roles/schemas/role.schema';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  // Reference to the module this permission applies to
  @Prop({ type: Types.ObjectId, ref: 'AppModule', required: true })
  moduleId: Types.ObjectId;

  // Module name for quick lookup
  @Prop({ required: true })
  moduleName: string;

  @Prop({ enum: Object.values(PermissionAction), required: true })
  action: PermissionAction;

  // Whether this permission is active
  @Prop({ default: true })
  isActive: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Compound unique index to prevent duplicate module+action combinations
PermissionSchema.index({ moduleId: 1, action: 1 }, { unique: true });
PermissionSchema.index({ moduleName: 1, action: 1 });

// Transform output
PermissionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

PermissionSchema.set('toObject', { virtuals: true });
