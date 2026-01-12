import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './schemas/permission.schema';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private permissionModel: Model<Permission>) {}

  async create(permissionData: any) {
    const permission = new this.permissionModel(permissionData);
    return permission.save();
  }

  async findAll() {
    return this.permissionModel.find().exec();
  }

  async findByModule(module: string) {
    return this.permissionModel.find({ module }).exec();
  }

  async findOne(id: string) {
    return this.permissionModel.findById(id).exec();
  }

  async update(id: string, permissionData: any) {
    return this.permissionModel.findByIdAndUpdate(id, permissionData, { new: true }).exec();
  }

  async delete(id: string) {
    return this.permissionModel.findByIdAndDelete(id).exec();
  }
}
