import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  module: string;

  @Prop()
  resourceId?: string;

  @Prop()
  resourceType?: string;

  @Prop({ type: Object })
  changes?: {
    before?: any;
    after?: any;
  };

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ 
    enum: ['success', 'failed'],
    default: 'success'
  })
  status: string;

  @Prop()
  errorMessage?: string;

  @Prop()
  createdAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, action: 1 });
