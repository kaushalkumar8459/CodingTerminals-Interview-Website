import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

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
