import { IsDefined, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  username!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  password!: string;
}
