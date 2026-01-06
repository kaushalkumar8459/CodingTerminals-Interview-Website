import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) {}

  async createDefaultPermissions() {
    const permissions = [
      // Blog Permissions
      { name: 'blog_create', description: 'Create blog posts', module: 'blog', action: 'create' },
      { name: 'blog_edit', description: 'Edit blog posts', module: 'blog', action: 'edit' },
      { name: 'blog_delete', description: 'Delete blog posts', module: 'blog', action: 'delete' },
      { name: 'blog_view', description: 'View blog posts', module: 'blog', action: 'view' },
      { name: 'blog_publish', description: 'Publish blog posts', module: 'blog', action: 'publish' },

      // LinkedIn Permissions
      { name: 'linkedin_create', description: 'Create LinkedIn posts', module: 'linkedin', action: 'create' },
      { name: 'linkedin_edit', description: 'Edit LinkedIn posts', module: 'linkedin', action: 'edit' },
      { name: 'linkedin_delete', description: 'Delete LinkedIn posts', module: 'linkedin', action: 'delete' },
      { name: 'linkedin_view', description: 'View LinkedIn posts', module: 'linkedin', action: 'view' },
      { name: 'linkedin_schedule', description: 'Schedule LinkedIn posts', module: 'linkedin', action: 'schedule' },

      // YouTube Permissions
      { name: 'youtube_create', description: 'Create YouTube videos', module: 'youtube', action: 'create' },
      { name: 'youtube_edit', description: 'Edit YouTube videos', module: 'youtube', action: 'edit' },
      { name: 'youtube_delete', description: 'Delete YouTube videos', module: 'youtube', action: 'delete' },
      { name: 'youtube_view', description: 'View YouTube videos', module: 'youtube', action: 'view' },

      // Study Notes Permissions
      { name: 'study_notes_create', description: 'Create study notes', module: 'study-notes', action: 'create' },
      { name: 'study_notes_edit', description: 'Edit study notes', module: 'study-notes', action: 'edit' },
      { name: 'study_notes_delete', description: 'Delete study notes', module: 'study-notes', action: 'delete' },
      { name: 'study_notes_view', description: 'View study notes', module: 'study-notes', action: 'view' },

      // User Management Permissions
      { name: 'users_view', description: 'View users', module: 'users', action: 'view' },
      { name: 'users_create', description: 'Create users', module: 'users', action: 'create' },
      { name: 'users_edit', description: 'Edit users', module: 'users', action: 'edit' },
      { name: 'users_delete', description: 'Delete users', module: 'users', action: 'delete' },

      // Module Management Permissions
      { name: 'modules_view', description: 'View modules', module: 'modules', action: 'view' },
      { name: 'modules_edit', description: 'Edit modules', module: 'modules', action: 'edit' },
      { name: 'modules_enable', description: 'Enable/disable modules', module: 'modules', action: 'enable' },
    ];

    for (const permission of permissions) {
      const exists = await this.permissionModel.findOne({ name: permission.name });
      if (!exists) {
        await this.permissionModel.create(permission);
      }
    }
  }

  async create(name: string, description: string, module: string, action: string) {
    const permission = new this.permissionModel({ name, description, module, action });
    return permission.save();
  }

  async findAll() {
    return this.permissionModel.find({ isActive: true }).exec();
  }

  async findById(id: string) {
    return this.permissionModel.findById(id).exec();
  }

  async findByModule(module: string) {
    return this.permissionModel.find({ module, isActive: true }).exec();
  }

  async update(id: string, updateData: any) {
    return this.permissionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string) {
    return this.permissionModel.findByIdAndDelete(id).exec();
  }

  async getPermissionsByAction(action: string) {
    return this.permissionModel.find({ action }).exec();
  }
}
