import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345',
    description: '5-digit PIN code',
    minLength: 5,
    maxLength: 5,
  })
  @IsString()
  @Length(5, 5)
  pinCode: string;
}

