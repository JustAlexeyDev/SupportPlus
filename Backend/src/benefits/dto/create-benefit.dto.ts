import { IsString, IsEnum, IsArray, IsDateString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BenefitType } from '../entities/benefit.entity';

export class CreateBenefitDto {
  @ApiProperty({ description: 'Unique benefit ID' })
  @IsString()
  benefitId: string;

  @ApiProperty({ description: 'Benefit title' })
  @IsString()
  title: string;

  @ApiProperty({ enum: BenefitType, description: 'Benefit type' })
  @IsEnum(BenefitType)
  type: BenefitType;

  @ApiProperty({ description: 'Target beneficiary category IDs', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  targetGroupIds: number[];

  @ApiProperty({ description: 'Applicable regions', type: [String] })
  @IsArray()
  @IsString({ each: true })
  regions: string[];

  @ApiProperty({ description: 'Valid from date (YYYY-MM-DD)' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ description: 'Valid to date (YYYY-MM-DD)' })
  @IsDateString()
  validTo: string;

  @ApiPropertyOptional({ description: 'Requirements' })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({ description: 'How to get the benefit' })
  @IsOptional()
  @IsString()
  howToGet?: string;

  @ApiPropertyOptional({ description: 'Source URL' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Partner name (null for state benefits)' })
  @IsOptional()
  @IsString()
  partner?: string | null;

  @ApiPropertyOptional({ description: 'Popularity score', default: 0 })
  @IsOptional()
  @IsNumber()
  popularity?: number;

  @ApiPropertyOptional({ description: 'Requires confirmation', default: false })
  @IsOptional()
  @IsBoolean()
  requiresConfirmation?: boolean;
}

