import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  userId: string;

  @IsString()
  action: string;

  @IsString()
  module: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsString()
  @IsOptional()
  resourceType?: string;

  @IsObject()
  @IsOptional()
  changes?: any;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}
