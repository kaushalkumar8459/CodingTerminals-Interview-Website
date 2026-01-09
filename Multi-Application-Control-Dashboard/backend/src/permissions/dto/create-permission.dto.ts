import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  module: string;

  @IsString()
  action: string;
}

export class UpdatePermissionDto {
  name?: string;
  description?: string;
}
