import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateStatsDto {
  @IsString()
  module: string;

  @IsString()
  metric: string;

  @IsNumber()
  value: number;
}

export class IncrementStatsDto {
  @IsString()
  module: string;

  @IsString()
  metric: string;

  @IsNumber()
  @IsOptional()
  increment?: number;
}
