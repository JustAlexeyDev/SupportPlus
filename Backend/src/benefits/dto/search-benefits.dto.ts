import { IsOptional, IsString, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BenefitType } from '../entities/benefit.entity';

export enum SortBy {
  RELEVANCE = 'relevance',
  DATE = 'date',
  POPULARITY = 'popularity',
}

export enum TermFilter {
  ACTIVE = 'active',
  EXPIRING_SOON = 'expiring_soon',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
}

export class SearchBenefitsDto {
  @ApiPropertyOptional({ description: 'Search query (keywords)' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by type',
    enum: BenefitType,
    isArray: true 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(BenefitType, { each: true })
  type?: BenefitType[];

  @ApiPropertyOptional({ 
    description: 'Filter by beneficiary category IDs',
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  categoryIds?: number[];

  @ApiPropertyOptional({ 
    description: 'Filter by region codes',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional({ 
    description: 'Filter by term status',
    enum: TermFilter,
    isArray: true 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TermFilter, { each: true })
  termFilter?: TermFilter[];

  @ApiPropertyOptional({ 
    description: 'Sort by',
    enum: SortBy,
    default: SortBy.RELEVANCE 
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.RELEVANCE;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

