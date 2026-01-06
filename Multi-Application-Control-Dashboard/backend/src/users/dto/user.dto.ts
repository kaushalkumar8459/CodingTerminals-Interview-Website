import { IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(['super_admin', 'admin', 'moderator', 'user'])
  @IsOptional()
  role?: string;

  @IsOptional()
  assignedModules?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(['super_admin', 'admin', 'moderator', 'user'])
  role?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  assignedModules?: string[];
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
