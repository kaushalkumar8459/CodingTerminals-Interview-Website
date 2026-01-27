import { IsString, IsOptional, MinLength, IsEnum, IsMongoId, IsBoolean } from 'class-validator';
import { PermissionAction } from '../../roles/schemas/role.schema';

export class CreatePermissionDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  description: string;

  @IsMongoId()
  moduleId: string;

  @IsString()
  moduleName: string;

  @IsEnum(PermissionAction)
  action: PermissionAction;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePermissionDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
