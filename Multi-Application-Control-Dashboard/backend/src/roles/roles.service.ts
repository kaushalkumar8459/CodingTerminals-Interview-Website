import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { Permission, PermissionDocument } from '../permissions/schemas/permission.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) {}

  async createDefaultRoles() {
    const roles = [
      {
        name: 'super_admin',
        description: 'Super Administrator with full system access',
        permissions: ['*'],
        isActive: true,
      },
      {
        name: 'admin',
        description: 'Administrator with content management access',
        permissions: ['content_create', 'content_edit', 'content_delete', 'content_view'],
        isActive: true,
      },
      {
        name: 'moderator',
        description: 'Moderator with limited content access',
        permissions: ['content_view', 'content_edit'],
        isActive: true,
      },
      {
        name: 'user',
        description: 'Regular user with view-only access',
        permissions: ['content_view'],
        isActive: true,
      },
    ];

    for (const role of roles) {
      const exists = await this.roleModel.findOne({ name: role.name });
      if (!exists) {
        await this.roleModel.create(role);
      }
    }
  }

  async create(name: string, description: string, level: string, permissions: string[]) {
    const role = new this.roleModel({ name, description, level, permissions });
    return role.save();
  }

  async findAll() {
    return this.roleModel.find({ isActive: true }).exec();
  }

  async findByName(name: string) {
    return this.roleModel.findOne({ name, isActive: true }).exec();
  }

  async findById(id: string) {
    return this.roleModel.findById(id).exec();
  }

  async update(id: string, updateData: any) {
    return this.roleModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string) {
    return this.roleModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async getRolesByLevel(level: string) {
    return this.roleModel.find({ level, isActive: true }).exec();
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    return this.roleModel
      .findByIdAndUpdate(roleId, { permissions: permissionIds }, { new: true })
      .exec();
  }
}
