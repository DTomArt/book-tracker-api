import {
  IsInt,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetBooksDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  cursor?: string;
}
