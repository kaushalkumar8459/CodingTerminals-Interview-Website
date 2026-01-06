import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async create(roleData: any) {
    const role = new this.roleModel(roleData);
    return role.save();
  }

  async findAll() {
    return this.roleModel.find().exec();
  }

  async findOne(id: string) {
    return this.roleModel.findById(id).exec();
  }

  async findByName(name: string) {
    return this.roleModel.findOne({ name }).exec();
  }

  async update(id: string, roleData: any) {
    return this.roleModel.findByIdAndUpdate(id, roleData, { new: true }).exec();
  }

  async delete(id: string) {
    return this.roleModel.findByIdAndDelete(id).exec();
  }

  async assignPermissions(roleId: string, permissions: string[]) {
    return this.roleModel
      .findByIdAndUpdate(roleId, { permissions }, { new: true })
      .exec();
  }

  async assignModules(roleId: string, modules: string[]) {
    return this.roleModel
      .findByIdAndUpdate(roleId, { modules }, { new: true })
      .exec();
  }
}
