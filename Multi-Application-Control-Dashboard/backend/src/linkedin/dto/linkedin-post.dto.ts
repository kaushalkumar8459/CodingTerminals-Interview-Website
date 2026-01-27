import { IsString, IsOptional, IsArray, IsEnum, IsDate } from 'class-validator';
import { PostStatus } from '../schemas/linkedin-post.schema';

export class CreateLinkedInPostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  hashtags?: string[];

  @IsOptional()
  @IsDate()
  scheduledDate?: Date;
}

export class UpdateLinkedInPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  hashtags?: string[];

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsDate()
  scheduledDate?: Date;
}
