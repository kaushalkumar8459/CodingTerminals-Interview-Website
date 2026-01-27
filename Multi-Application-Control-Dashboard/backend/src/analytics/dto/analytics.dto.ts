import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

export class CreateAnalyticsDto {
  @IsString()
  module: string;

  @IsString()
  eventType: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsNumber()
  @IsOptional()
  count?: number;
}

export class UpdateAnalyticsDto {
  @IsString()
  @IsOptional()
  eventType?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsNumber()
  @IsOptional()
  count?: number;
}
