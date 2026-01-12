import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['super-admin', 'admin', 'viewer'])
  role: string;

  @IsString()
  @MinLength(3)
  username: string;
}

export class UpdateUserDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @IsString({ each: true })
  assignedModules?: string[];
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
