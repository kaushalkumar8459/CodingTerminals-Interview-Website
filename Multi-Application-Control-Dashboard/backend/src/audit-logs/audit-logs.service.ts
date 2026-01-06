import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>) {}

  async log(userId: string, action: string, module: string, resourceId?: string, resourceType?: string, changes?: any, ipAddress?: string, userAgent?: string) {
    const auditLog = new this.auditLogModel({
      userId,
      action,
      module,
      resourceId,
      resourceType,
      changes,
      ipAddress,
      userAgent,
      status: 'success'
    });
    return auditLog.save();
  }

  async logError(userId: string, action: string, module: string, errorMessage: string, ipAddress?: string, userAgent?: string) {
    const auditLog = new this.auditLogModel({
      userId,
      action,
      module,
      errorMessage,
      ipAddress,
      userAgent,
      status: 'failed'
    });
    return auditLog.save();
  }

  async findAll() {
    return this.auditLogModel.find().sort({ createdAt: -1 }).limit(1000).exec();
  }

  async findByUserId(userId: string) {
    return this.auditLogModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findByModule(module: string) {
    return this.auditLogModel.find({ module }).sort({ createdAt: -1 }).exec();
  }

  async findByAction(action: string) {
    return this.auditLogModel.find({ action }).sort({ createdAt: -1 }).exec();
  }

  async getStats() {
    const total = await this.auditLogModel.countDocuments();
    const success = await this.auditLogModel.countDocuments({ status: 'success' });
    const failed = await this.auditLogModel.countDocuments({ status: 'failed' });
    return { total, success, failed };
  }

  async getActivityByDate(startDate: Date, endDate: Date) {
    return this.auditLogModel.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 }).exec();
  }
}
