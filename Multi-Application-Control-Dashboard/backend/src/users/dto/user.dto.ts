import { IsEmail, IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { RoleType, UserStatus } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsArray()
  assignedModules?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsArray()
  assignedModules?: string[];
}

export class AssignRoleDto {
  @IsEnum(RoleType)
  role: RoleType;
}

export class AssignModulesDto {
  @IsArray()
  moduleIds: string[];
}
