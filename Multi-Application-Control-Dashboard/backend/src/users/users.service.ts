import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RoleType, PermissionAction } from '../roles/schemas/role.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async findAll() {
    return this.userModel.find().select('-password').populate('assignedModules').exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).select('-password').populate('assignedModules').exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select('-password').exec();
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async assignModules(userId: string, moduleIds: string[]) {
    return this.userModel
      .findByIdAndUpdate(userId, { assignedModules: moduleIds }, { new: true })
      .populate('assignedModules')
      .exec();
  }

  async assignRole(userId: string, role: string) {
    return this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .exec();
  }

  async search(query: string) {
    return this.userModel
      .find({
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
        ],
      })
      .select('-password')
      .exec();
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userModel.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true }).select('-password').exec();
  }

  /**
   * Get user's effective permissions based on role and assigned modules
   */
  async getUserPermissions(userId: string) {
    const user = await this.userModel.findById(userId).populate('assignedModules').exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const permissions: { module: string; actions: PermissionAction[] }[] = [];
    const allActions = Object.values(PermissionAction);

    // Super Admin has all permissions on all modules
    if (user.role === RoleType.SUPER_ADMIN) {
      const modules = ['Blog', 'YouTube', 'LinkedIn', 'Study Notes', 'Dashboard', 'Analytics', 'Audit Logs', 'User Management', 'Module Settings'];
      return {
        role: user.role,
        permissions: modules.map(module => ({
          module,
          actions: allActions,
        })),
        canManageUsers: true,
        canManageRoles: true,
        canManageModules: true,
      };
    }

    // Viewer has only VIEW permission
    if (user.role === RoleType.VIEWER) {
      const assignedModuleNames = user.assignedModules.map((m: any) => m.name || m.toString());
      return {
        role: user.role,
        permissions: assignedModuleNames.map(module => ({
          module,
          actions: [PermissionAction.VIEW],
        })),
        canManageUsers: false,
        canManageRoles: false,
        canManageModules: false,
      };
    }

    // Normal User has access to Profile, Settings, and their personal dashboard
    if (user.role === RoleType.NORMAL_USER) {
      return {
        role: user.role,
        permissions: [
          { module: 'Profile', actions: [PermissionAction.VIEW, PermissionAction.EDIT] },
          { module: 'Settings', actions: [PermissionAction.VIEW, PermissionAction.EDIT] },
          { module: 'Dashboard', actions: [PermissionAction.VIEW] },
          // Allow access to their own personal dashboard features
          { module: 'Personal Dashboard', actions: [PermissionAction.VIEW] },
        ],
        canManageUsers: false,
        canManageRoles: false,
        canManageModules: false,
        // Add a flag indicating this is a normal user who should be redirected for admin tasks
        requiresRedirectionForAdminTasks: true,
      };
    }

    // Admin has CRUD on assigned modules
    if (user.role === RoleType.ADMIN) {
      const assignedModuleNames = user.assignedModules.map((m: any) => m.name || m.toString());
      return {
        role: user.role,
        permissions: assignedModuleNames.map(module => ({
          module,
          actions: allActions, // Admin gets full CRUD on assigned modules
        })),
        canManageUsers: false,
        canManageRoles: false,
        canManageModules: false,
      };
    }

    return {
      role: user.role,
      permissions: [],
      canManageUsers: false,
      canManageRoles: false,
      canManageModules: false,
    };
  }
}