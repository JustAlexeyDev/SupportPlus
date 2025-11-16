import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestSmsDto {
  @ApiProperty({
    example: '+79991234567',
    description: 'Phone number in international format',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid international format',
  })
  phone: string;
}

export class VerifySmsDto {
  @ApiProperty({
    example: '+79991234567',
    description: 'Phone number in international format',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid international format',
  })
  phone: string;

  @ApiProperty({
    example: '12345',
    description: '5-digit SMS code',
    minLength: 5,
    maxLength: 5,
  })
  @IsString()
  @Length(5, 5)
  code: string;
}





