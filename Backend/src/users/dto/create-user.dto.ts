import { IsEmail, IsString, Length, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
  pinCode: string; // 5-digit PIN

  @ApiProperty({
    example: '123-456-789 01',
    description: 'SNILS number',
    required: false,
  })
  @IsOptional()
  @IsString()
  snils?: string;

  @ApiProperty({
    example: 'Москва',
    description: 'Region of residence',
    required: false,
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({
    example: [1, 2],
    description: 'Array of beneficiary category IDs',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  beneficiaryCategoryIds?: number[];
}

