import { IsString, IsOptional } from 'class-validator';

export class CreateYouTubePostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  videoId: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}

export class UpdateYouTubePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
