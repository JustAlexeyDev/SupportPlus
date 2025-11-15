import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: '123-456-789 01',
    description: 'SNILS number',
    required: false,
  })
  @IsOptional()
  @IsString()
  snils?: string;

  @ApiProperty({
    example: 'Санкт-Петербург',
    description: 'Region of residence',
    required: false,
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({
    example: [1, 3, 5],
    description: 'Array of beneficiary category IDs',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  beneficiaryCategoryIds?: number[];
}

