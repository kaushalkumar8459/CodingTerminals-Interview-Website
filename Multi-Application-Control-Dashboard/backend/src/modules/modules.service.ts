import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './schemas/module.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ModulesService {
  constructor(
    @InjectModel(AppModule.name) private moduleModel: Model<AppModule>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async create(moduleData: any) {
    const module = new this.moduleModel(moduleData);
    return module.save();
  }

  async findAll() {
    return this.moduleModel.find().exec();
  }

  async findEnabled() {
    return this.moduleModel.find({ enabled: true }).exec();
  }

  async findOne(id: string) {
    return this.moduleModel.findById(id).exec();
  }

  async update(id: string, moduleData: any) {
    return this.moduleModel.findByIdAndUpdate(id, moduleData, { new: true }).exec();
  }

  async delete(id: string) {
    return this.moduleModel.findByIdAndDelete(id).exec();
  }

  async toggleModule(id: string, enabled: boolean) {
    return this.moduleModel
      .findByIdAndUpdate(id, { enabled }, { new: true })
      .exec();
  }

  async getModuleStats() {
    const modules = await this.moduleModel.find().exec();
    return modules.map(m => ({
      id: m._id,
      name: m.name,
      enabled: m.enabled,
      userCount: m.userCount,
      description: m.description,
    }));
  }

  async checkModuleAccess(userId: string, moduleName: string): Promise<boolean> {
    try {
      // Find the user
      const user = await this.userModel.findById(userId).populate('assignedModules').exec();
      
      if (!user) {
        return false;
      }

      // Super admins have access to all modules
      if (user.role === 'super_admin') {
        return true;
      }

      // Check if module exists and is enabled
      const module = await this.moduleModel.findOne({ name: moduleName, enabled: true }).exec();
      if (!module) {
        return false;
      }

      // Check if module is in user's assigned modules
      if (user.assignedModules && user.assignedModules.length > 0) {
        const moduleIds = user.assignedModules.map(m => m.toString());
        return moduleIds.includes(module._id.toString());
      }

      // For users with no assigned modules, check role
      // Admins get access to all enabled modules by default
      if (user.role === 'admin') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking module access:', error);
      return false;
    }
  }
}