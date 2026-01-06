import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from './schemas/module.schema';

@Injectable()
export class ModulesService {
  constructor(@InjectModel(AppModule.name) private moduleModel: Model<AppModule>) {}

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
}
