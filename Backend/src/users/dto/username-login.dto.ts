import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsernameLoginDto {
  @ApiProperty({
    example: 'username',
    description: 'User login/username',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

