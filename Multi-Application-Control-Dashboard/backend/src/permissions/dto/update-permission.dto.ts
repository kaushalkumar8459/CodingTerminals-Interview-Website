import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  module?: string;

  @IsString()
  @IsOptional()
  action?: string;
}
