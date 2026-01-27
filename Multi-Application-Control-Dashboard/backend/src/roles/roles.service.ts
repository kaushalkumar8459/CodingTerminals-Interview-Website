import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument, RoleType, PermissionAction } from './schemas/role.schema';
import { CreateRoleDto, UpdateRoleDto, AssignModulePermissionsDto, ModulePermissionDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role name already exists
    const existingRole = await this.roleModel.findOne({ name: createRoleDto.name }).exec();
    if (existingRole) {
      throw new ConflictException(`Role with name '${createRoleDto.name}' already exists`);
    }

    const role = new this.roleModel(createRoleDto);
    return role.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name }).exec();
  }

  async findByType(type: RoleType): Promise<Role[]> {
    return this.roleModel.find({ type }).exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    // Prevent updating system roles' type
    if (role.isSystemRole && updateRoleDto.name) {
      throw new BadRequestException('Cannot change the name of a system role');
    }

    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true }).exec();
  }

  async delete(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete a system role');
    }

    return this.roleModel.findByIdAndDelete(id).exec();
  }

  async assignModulePermissions(roleId: string, dto: AssignModulePermissionsDto): Promise<Role> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    // Validate and transform module permissions
    const modulePermissions = dto.modulePermissions.map((mp) => ({
      moduleId: new Types.ObjectId(mp.moduleId),
      moduleName: mp.moduleName,
      actions: mp.actions,
    }));

    return this.roleModel
      .findByIdAndUpdate(roleId, { modulePermissions }, { new: true })
      .exec();
  }

  async addModulePermission(roleId: string, modulePermission: ModulePermissionDto): Promise<Role> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    // Check if module already has permissions
    const existingIndex = role.modulePermissions.findIndex(
      (mp) => mp.moduleId.toString() === modulePermission.moduleId
    );

    if (existingIndex >= 0) {
      // Update existing module permissions
      role.modulePermissions[existingIndex].actions = modulePermission.actions;
    } else {
      // Add new module permission
      role.modulePermissions.push({
        moduleId: new Types.ObjectId(modulePermission.moduleId),
        moduleName: modulePermission.moduleName,
        actions: modulePermission.actions,
      });
    }

    return role.save();
  }

  async removeModulePermission(roleId: string, moduleId: string): Promise<Role> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    role.modulePermissions = role.modulePermissions.filter(
      (mp) => mp.moduleId.toString() !== moduleId
    );

    return role.save();
  }

  async hasPermission(roleId: string, moduleId: string, action: PermissionAction): Promise<boolean> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      return false;
    }

    // Super admin has all permissions
    if (role.type === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Viewer can only view
    if (role.type === RoleType.VIEWER && action !== PermissionAction.VIEW) {
      return false;
    }

    const modulePermission = role.modulePermissions.find(
      (mp) => mp.moduleId.toString() === moduleId
    );

    if (!modulePermission) {
      return false;
    }

    return modulePermission.actions.includes(action);
  }

  async getModulePermissions(roleId: string, moduleId: string): Promise<PermissionAction[]> {
    const role = await this.roleModel.findById(roleId).exec();
    if (!role) {
      return [];
    }

    // Super admin has all permissions
    if (role.type === RoleType.SUPER_ADMIN) {
      return Object.values(PermissionAction);
    }

    // Viewer can only view
    if (role.type === RoleType.VIEWER) {
      return [PermissionAction.VIEW];
    }

    const modulePermission = role.modulePermissions.find(
      (mp) => mp.moduleId.toString() === moduleId
    );

    return modulePermission?.actions || [];
  }

  // Initialize system roles (call this on app startup)
  async initializeSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: 'Super Admin',
        type: RoleType.SUPER_ADMIN,
        description: 'Full system access with all permissions',
        isSystemRole: true,
        modulePermissions: [], // Super admin bypasses permission checks
      },
      {
        name: 'Admin',
        type: RoleType.ADMIN,
        description: 'Administrative access to assigned modules',
        isSystemRole: true,
        modulePermissions: [],
      },
      {
        name: 'Normal User',
        type: RoleType.NORMAL_USER,
        description: 'Regular user with access to personal dashboard',
        isSystemRole: true,
        modulePermissions: [],
      },
      {
        name: 'Viewer',
        type: RoleType.VIEWER,
        description: 'Read-only access to public content',
        isSystemRole: true,
        modulePermissions: [],
      },
    ];

    for (const roleData of systemRoles) {
      const existingRole = await this.roleModel.findOne({ type: roleData.type, isSystemRole: true }).exec();
      if (!existingRole) {
        await this.roleModel.create(roleData);
      }
    }
  }
}
