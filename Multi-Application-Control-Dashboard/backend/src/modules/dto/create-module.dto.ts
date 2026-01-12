import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @IsOptional()
  route?: string;
}

export class UpdateModuleDto {
  name?: string;
  description?: string;
}
