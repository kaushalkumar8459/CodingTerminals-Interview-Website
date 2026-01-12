import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  permissions?: string[];

  @IsArray()
  @IsOptional()
  modules?: string[];
}

export class UpdateRoleDto {
  name?: string;
  description?: string;
}
