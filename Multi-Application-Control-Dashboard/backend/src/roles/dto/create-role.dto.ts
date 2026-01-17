import { IsString, IsArray, IsOptional, MinLength, IsEnum, IsBoolean, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { RoleType, PermissionAction } from '../schemas/role.schema';

export class ModulePermissionDto {
  @IsMongoId()
  moduleId: string;

  @IsString()
  moduleName: string;

  @IsArray()
  @IsEnum(PermissionAction, { each: true })
  actions: PermissionAction[];
}

export class CreateRoleDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEnum(RoleType)
  type: RoleType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModulePermissionDto)
  @IsOptional()
  modulePermissions?: ModulePermissionDto[];

  @IsBoolean()
  @IsOptional()
  isSystemRole?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRoleDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModulePermissionDto)
  @IsOptional()
  modulePermissions?: ModulePermissionDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AssignModulePermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModulePermissionDto)
  modulePermissions: ModulePermissionDto[];
}
