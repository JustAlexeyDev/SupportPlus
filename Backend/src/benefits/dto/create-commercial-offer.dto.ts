import { IsString, IsEnum, IsArray, IsDateString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommercialOfferType } from '../entities/commercial-offer.entity';

export class CreateCommercialOfferDto {
  @ApiProperty({ description: 'Unique offer ID' })
  @IsString()
  offerId: string;

  @ApiProperty({ description: 'Offer title' })
  @IsString()
  title: string;

  @ApiProperty({ enum: CommercialOfferType, description: 'Offer type' })
  @IsEnum(CommercialOfferType)
  type: CommercialOfferType;

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

  @ApiPropertyOptional({ description: 'How to get the offer' })
  @IsOptional()
  @IsString()
  howToGet?: string;

  @ApiPropertyOptional({ description: 'Source URL' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiProperty({ description: 'Partner name' })
  @IsString()
  partner: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Popularity score', default: 0 })
  @IsOptional()
  @IsNumber()
  popularity?: number;

  @ApiPropertyOptional({ description: 'Requires confirmation', default: false })
  @IsOptional()
  @IsBoolean()
  requiresConfirmation?: boolean;
}

