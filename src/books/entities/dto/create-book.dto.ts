import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  author!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  isbn!: string;

  @IsInt()
  @Min(1)
  numberOfPages!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
