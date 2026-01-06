import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule as AppModuleEntity, ModuleDocument } from './schemas/module.schema';

@Injectable()
export class ModulesService {
  constructor(
    @InjectModel(AppModuleEntity.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  async createDefaultModules() {
    const modules = [
      {
        name: 'blog',
        displayName: 'Blog Management',
        description: 'Create, edit, and publish blog posts',
        enabled: true,
        icon: 'bi-pencil-square',
        category: 'Content',
        allowedRoles: ['super_admin', 'admin', 'moderator'],
        route: '/features/blog',
      },
      {
        name: 'linkedin',
        displayName: 'LinkedIn Posts',
        description: 'Manage and schedule LinkedIn posts',
        enabled: true,
        icon: 'bi-linkedin',
        category: 'Social',
        allowedRoles: ['super_admin', 'admin', 'moderator'],
        route: '/features/linkedin',
      },
      {
        name: 'youtube',
        displayName: 'YouTube Management',
        description: 'Manage YouTube videos and playlists',
        enabled: true,
        icon: 'bi-youtube',
        category: 'Media',
        allowedRoles: ['super_admin', 'admin', 'moderator'],
        route: '/features/youtube',
      },
      {
        name: 'study-notes',
        displayName: 'Study Notes',
        description: 'Create and organize study materials',
        enabled: true,
        icon: 'bi-book',
        category: 'Educational',
        allowedRoles: ['super_admin', 'admin', 'user'],
        route: '/features/study-notes',
      },
      {
        name: 'admin-panel',
        displayName: 'Admin Panel',
        description: 'System administration and user management',
        enabled: true,
        icon: 'bi-gear',
        category: 'Administration',
        allowedRoles: ['super_admin'],
        route: '/features/admin',
      },
    ];

    for (const module of modules) {
      const exists = await this.moduleModel.findOne({ name: module.name });
      if (!exists) {
        await this.moduleModel.create(module);
      }
    }
  }

  async findAll() {
    return this.moduleModel.find({ enabled: true }).exec();
  }

  async findById(id: string) {
    return this.moduleModel.findById(id).exec();
  }

  async findByName(name: string) {
    return this.moduleModel.findOne({ name }).exec();
  }

  async create(moduleData: any) {
    return this.moduleModel.create(moduleData);
  }

  async update(id: string, moduleData: any) {
    return this.moduleModel.findByIdAndUpdate(id, moduleData, { new: true }).exec();
  }

  async delete(id: string) {
    return this.moduleModel.findByIdAndUpdate(id, { enabled: false }).exec();
  }

  async enableModule(id: string) {
    return this.moduleModel.findByIdAndUpdate(id, { enabled: true }, { new: true }).exec();
  }

  async disableModule(id: string) {
    return this.moduleModel.findByIdAndUpdate(id, { enabled: false }, { new: true }).exec();
  }

  async toggleModule(id: string) {
    const module = await this.moduleModel.findById(id);
    if (!module) throw new Error('Module not found');
    module.enabled = !module.enabled;
    return module.save();
  }

  async getModuleStats() {
    const total = await this.moduleModel.countDocuments();
    const enabled = await this.moduleModel.countDocuments({ enabled: true });
    const disabled = await this.moduleModel.countDocuments({ enabled: false });

    return { total, enabled, disabled };
  }

  async getModulesByCategory(category: string) {
    return this.moduleModel.find({ category, enabled: true }).exec();
  }
}
