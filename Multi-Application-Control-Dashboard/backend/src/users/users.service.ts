import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Module, ModuleDocument } from '../modules/schemas/module.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  /**
   * Get all users (Super Admin only)
   */
  async getAllUsers() {
    return await this.userModel
      .find()
      .populate('role')
      .populate('assignedModules')
      .select('-password');
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('role')
      .populate('assignedModules')
      .select('-password');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: any) {
    const user = await this.userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Assign modules to user
   */
  async assignModulesToUser(userId: string, moduleIds: string[]) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify all modules exist
    const modules = await this.moduleModel.find({
      _id: { $in: moduleIds },
    });

    if (modules.length !== moduleIds.length) {
      throw new BadRequestException('One or more modules not found');
    }

    user.assignedModules = moduleIds.map((id) => new Types.ObjectId(id));
    await user.save();

    return user.populate('assignedModules');
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role: new Types.ObjectId(roleId) },
      { new: true },
    ).populate('role');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Promote user to admin
   */
  async promoteToAdmin(userId: string) {
    const adminRole = await this.roleModel.findOne({ name: 'admin' });
    if (!adminRole) throw new NotFoundException('Admin role not found');

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role: adminRole._id },
      { new: true },
    ).populate('role');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Activate user
   */
  async activateUser(userId: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Delete user (Super Admin only)
   */
  async deleteUser(userId: string) {
    const result = await this.userModel.findByIdAndDelete(userId);

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ isActive: true }).select('-password').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async changeStatus(id: string, status: string): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .select('-password')
      .exec();
  }

  async assignModules(id: string, moduleIds: string[]): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(id, { assignedModules: moduleIds }, { new: true })
      .select('-password')
      .exec();
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async search(query: string): Promise<UserDocument[]> {
    return this.userModel
      .find({
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
        ],
        isActive: true,
      })
      .select('-password')
      .exec();
  }

  async getStats() {
    const total = await this.userModel.countDocuments({ isActive: true });
    const active = await this.userModel.countDocuments({ status: 'active' });
    const inactive = await this.userModel.countDocuments({ status: 'inactive' });
    const suspended = await this.userModel.countDocuments({ status: 'suspended' });
    const admins = await this.userModel.countDocuments({ 
      role: { $in: ['super-admin', 'admin'] } 
    });

    return { total, active, inactive, suspended, admins };
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }

  async changeUserRole(userId: string, role: string): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .select('-password')
      .exec();
  }

  async changeUserStatus(userId: string, status: string): Promise<UserDocument> {
    return this.userModel
      .findByIdAndUpdate(userId, { status }, { new: true })
      .select('-password')
      .exec();
  }

  async searchUsers(query: string): Promise<UserDocument[]> {
    return this.userModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
      .select('-password')
      .exec();
  }

  async getUserStats(): Promise<any> {
    const total = await this.userModel.countDocuments();
    const active = await this.userModel.countDocuments({ status: 'active' });
    const admins = await this.userModel.countDocuments({ role: 'admin' });
    const superAdmins = await this.userModel.countDocuments({ role: 'super_admin' });
    const suspended = await this.userModel.countDocuments({ status: 'suspended' });

    return { total, active, admins, superAdmins, suspended };
  }
}
